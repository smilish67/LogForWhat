use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, SetAuthority, TokenAccount, Transfer};
use spl_token::instruction::AuthorityType;

declare_id!("2m9zddeqaVarWy3MHk59BSTZ6xF8jeWuHZCRXvQw5Noh");

#[program]
pub mod survey_rewards {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        _vault_account_bump: u8,
        initializer_amount: u64,
        taker_amount: u64,
    ) -> Result<()> {
        ctx.accounts.escrow_account.publisher_account = *ctx.accounts.initializer.key;
        ctx.accounts
            .escrow_account
            .publisher_token_account = *ctx
            .accounts
            .initializer_deposit_token_account
            .to_account_info()
            .key;
        ctx.accounts.escrow_account.guarantee = initializer_amount;
        ctx.accounts.escrow_account.reward = taker_amount;
        ctx.accounts.escrow_account.current_balance = initializer_amount;

        let escrow_pda_seed : &[u8] = ctx.accounts.escrow_account.to_account_info().key.as_ref();

        let (vault_authority, _vault_authority_bump) =
            Pubkey::find_program_address(&[escrow_pda_seed], ctx.program_id);
        token::set_authority(
            ctx.accounts.into_set_authority_context(),
            AuthorityType::AccountOwner,
            Some(vault_authority),
        )?;

        token::transfer(
            ctx.accounts.into_transfer_to_pda_context(),
            ctx.accounts.escrow_account.guarantee,
        )?;

        Ok(())
    }

    pub fn cancel(ctx: Context<Cancel>, ) -> Result<()> {
        let escrow_pda_seed : &[u8] = ctx.accounts.escrow_account.to_account_info().key.as_ref();
        let (_vault_authority, vault_authority_bump) =
            Pubkey::find_program_address(&[escrow_pda_seed], ctx.program_id);
        let authority_seeds = &[&escrow_pda_seed[..], &[vault_authority_bump]];


        token::transfer(
            ctx.accounts
                .into_transfer_to_initializer_context()
                .with_signer(&[&authority_seeds[..]]),
            ctx.accounts.escrow_account.current_balance,
        )?;

        token::close_account(
            ctx.accounts
                .into_close_context()
                .with_signer(&[&authority_seeds[..]]),
        )?;

        Ok(())
    }

    pub fn exchange(ctx: Context<Exchange>) -> Result<()> {
        let escrow_pda_seed : &[u8] = ctx.accounts.escrow_account.to_account_info().key.as_ref();
        let (_vault_authority, vault_authority_bump) =
            Pubkey::find_program_address(&[escrow_pda_seed], ctx.program_id);
        let authority_seeds = &[&escrow_pda_seed[..], &[vault_authority_bump]];

        token::transfer(
            ctx.accounts
                .into_transfer_to_taker_context()
                .with_signer(&[&authority_seeds[..]]),
            ctx.accounts.escrow_account.reward,
        )?;

        ctx.accounts.escrow_account.current_balance -= ctx.accounts.escrow_account.reward;
        if ctx.accounts.escrow_account.current_balance == 0 {
            token::close_account(
                ctx.accounts
                    .into_close_context()
                    .with_signer(&[&authority_seeds[..]]),
            )?;
        }

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(vault_account_bump: u8, guarantee: u64)]
pub struct Initialize<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut, signer)]
    pub initializer: AccountInfo<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        seeds = [escrow_account.to_account_info().key.as_ref()],
        bump,
        payer = initializer,
        token::mint = mint,
        token::authority = initializer,
    )]
    pub vault_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = initializer_deposit_token_account.amount >= guarantee
    )]
    pub initializer_deposit_token_account: Account<'info, TokenAccount>,
    #[account(zero)]
    pub escrow_account: Box<Account<'info, EscrowAccount>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut, signer)]
    pub initializer: AccountInfo<'info>,
    #[account(mut)]
    pub vault_account: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub vault_authority: AccountInfo<'info>,
    #[account(mut)]
    pub initializer_deposit_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = escrow_account.publisher_account == *initializer.key,
        constraint = escrow_account.publisher_token_account == *initializer_deposit_token_account.to_account_info().key,
        close = initializer
    )]
    pub escrow_account: Box<Account<'info, EscrowAccount>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Exchange<'info> {
    #[account(signer)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub taker: AccountInfo<'info>,
    #[account(mut)]
    pub taker_receive_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub initializer_deposit_token_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub initializer: AccountInfo<'info>,
    #[account(
        mut,
        constraint = escrow_account.publisher_account == *initializer.key,
    )]
    pub escrow_account: Box<Account<'info, EscrowAccount>>,
    #[account(mut)]
    pub vault_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub vault_authority: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}

#[account]
pub struct EscrowAccount {
    pub publisher_account: Pubkey,
    pub publisher_token_account: Pubkey,
    pub guarantee: u64,
    pub current_balance: u64,
    pub reward: u64,
}

impl<'info> Initialize<'info> {
    fn into_transfer_to_pda_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self
                .initializer_deposit_token_account
                .to_account_info()
                .clone(),
            to: self.vault_account.to_account_info().clone(),
            authority: self.initializer.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }

    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.vault_account.to_account_info().clone(),
            current_authority: self.initializer.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}

impl<'info> Cancel<'info> {
    fn into_transfer_to_initializer_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault_account.to_account_info().clone(),
            to: self
                .initializer_deposit_token_account
                .to_account_info()
                .clone(),
            authority: self.vault_authority.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }

    fn into_close_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.vault_account.to_account_info().clone(),
            destination: self.initializer.clone(),
            authority: self.vault_authority.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}

impl<'info> Exchange<'info> {
    fn into_transfer_to_taker_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault_account.to_account_info().clone(),
            to: self.taker_receive_token_account.to_account_info().clone(),
            authority: self.vault_authority.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }

    fn into_close_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.vault_account.to_account_info().clone(),
            destination: self.initializer.clone(),
            authority: self.vault_authority.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}
