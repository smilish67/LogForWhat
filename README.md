# LogForWhat 
앱테크, 짠테크, 보상형 설문조사 사이트
<br>

## 개요 
블록체인 기반 탈중앙화 설문 리워드 시스템을 구축하고, 완료된 설문을 NFT로 거래할 수 있는 플랫폼
<br>

## 맡은 역할
- 리더
- 솔라나 스마트 컨트랙트 작성 (Escrow 결제 방식)
- 설문 생성 및 작성 기능 (주관식, 객관식)
- 설문 DB 구축 
- 설문 데이터 NFT 발급 및 IPFS 업로드 기능
<br>

## 성과
- 교내 SW융합캡스톤 경진대회 (우수상)
- SW중심대학 공동창업 캠프 (대상)

## 리뷰
- 비즈니스 로직을 어떻게든 구현하는 데 초점을 맞추었어서 주먹구구식임
- 전체적인 설계를 다시하고, 설문 생성 및 응답 작성 과정에 AI 에이전트를 적용한 리뉴얼 버전 개발 예정

폴더
1. lw-nft-contract : NFT 관련 스마트 컨트랙트
2. lw-smart-contract : 설문조사 리워드 스마트 컨트랙트
3. lw-solana-wallet : 플랫폼 소유 지갑
4. server : 웹 서버 디렉토리

<hr>
스마트 컨트랙트 내용을 보고싶으면 1, 2번 폴더에서 아래 파일만 보면 됩니다.

NFT 관련
lw-nft-contract/programs/lw-nft-contract/src/lib.rs

리워드 관련
lw-smart-contract/programs/anchor-escrow/src/lib.rs
<hr>
4번 server는 웹 서버가 실행되는 디렉토리입니다.

server/src/ 폴더 위주로 살펴보면 됩니다.

src에는 5개의 폴더가 있습니다.
1. config : DB연결 및 설정
2. models : DB 쿼리에 사용될 함수들이 구현되어 있습니다.
3. public : 프론트에 쓰이는 js, css 파일이 담김
4. routes : 유저의 요청 라우팅 및 컨트롤러 역할 (API)
5. views : 확장자는 ejs인데 페이지 별 html 파일들이라 보시면 됩니다.

유저의 요청은 routes/index.js를 거쳐서 각 요청에 맞는 컨트롤러 파일의 함수(routes/home/컨트롤러파일.js)로 연결됩니다. 

ex) 유저가 api로 회원가입 화면("/auth/register")을 요청하면, 사용자 인증을 담당하는 컨트롤러 파일에 작성된 함수로 연결됩니다.

router.get("/auth/register", authCtrl.output.registerView);

index.js 파일에서는 post, get요청들을 볼 수 있고 각종 기능들은 전부 이런식으로 구현되어있습니다.
컨트롤러 파일들은 기능 별로 나뉘어 있습니다. (routes/home/ 에 위치)
1. auth.ctrl.js : 사용자 인증 관련 화면과 요청 처리
2. home.ctrl.js : 메인 화면에서의 화면과 요청 처리
3. nft.ctrl.js : nft 관련 요청 처리
4. survey.ctrl.js : 설문조사 관련 요청 처리

api 처리 과정을 정리하면 다음과 같습니다

유저가 api 호출 -> index.js에서 요청을 특정 컨트롤러 파일의 함수로 연결 -> 컨트롤러에서 작업 처리 (DB 작업이 필요한 경우 models에서 함수 호출)

<hr>

# DB구조 정리


logforcash는 5개의 테이블이 있습니다.
1. nft - NFT 관련 정보 테이블
2. option - 객관식 선택지 테이블 
3. question - 설문 문항 테이블
4. survey - 설문 정보 테이블
5. user - 유저 정보 테이블

<hr>

### 1. nft

surveyId (VARCHAR(30), PK, NN): 설문 id값

tokenName (VARCHAR(20), NN): NFT 이름

tokenDescription (VARCHAR(200), NN): NFT 설명

tokenAddress (VARCHAR(60), NN): NFT 어드레스

enrollDate (DATETIME): NFT 등록 날짜

price (DOUBLE): NFT 가격

### 2. option

특정 question의 선택지들을 담아야 하므로, question 테이블의 questionId를 외래키로 갖습니다.

questionId (VARCHAR(36), PK, NN, FK(question)): question 테이블의 questionId를 외래키로 가짐

optionNum (INT(11), PK, NN): 옵션 번호, questionId와 함께 기본키가 됩니다.

optionText (VARCHAR(200), NN): 선택지 텍스트

### 3. question

questionId (VARCHAR(36), PK, NN): 설문 문항 ID

surveyId (VARCHAR(36), NN, FK): 연결되는 설문지의 ID

questionNum (INT(11), NN): 문항 번호

questionTitle (VARCHAR(200), NN): 문항 제목

questionType (INT(11), NN): 문항 형식(객관식, 주관식만 구현 예정)

maxLenAns (INT(11), NN): 응답 크기 제한(주관식의 경우 글자 수)

### 4. survey

surveyId (VARCHAR(36), PK, NN): 설문지 ID

surveyTitle (VARCHAR(60), NN): 설문지 제목

publisher (VARCHAR(45)): 설문 의뢰자 지갑 주소

maxAnswerer (INT(11), NN): 최대 응답자 수

addInfo (TINYTEXT): 설문 정보

questionCnt (INT(11), NN): 문항 수

enrollDate (DATETIME, NN): 설문 의뢰 날짜

escrowAddress (VARCHAR(45)): 담보 계좌

reward (DOUBLE, NN): 보상 수량

incentive (DOUBLE, NN): 로열티 수량

curAnswerCnt (INT(11), NN): 현재 응답자 수

publisherATA (VARCHAR(45), NN): 설문 의뢰자의 UPZ ATA 계좌

isFinished (TINYINT(4), NN): 설문 상태

csvPath (VARCHAR(100)): 설문 결과 데이터 파일 경로

### 5. user

userEmail (VARCHAR(45), PK, NN): 사용자의 이메일

userPassword (VARCHAR(60), NN): 유저의 패스워드

userAge (VARCHAR(6), NN): 사용자 나이

userGender (VARCHR(6), NN): 사용자 성별

userRegisterDate (DATETIME, NN): 사용자 등록 날짜

userWalletAddress (VARCHAR(45), UQ): 사용자의 지갑 주소

walletChangedDate (DATETIME): 사용자의 마지막 지갑주소 변경일

userATA (VARCHAR(45), UQ): 사용자의 UPZ ATA 어드레스
