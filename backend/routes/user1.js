const express = require('express');
const router = express.Router();

// /api/user

// 유저 정보
router.get("/", ( req, res) => {
    return res.json({test: "test"});
});                                                                                                                                                                                                       

//유저 회원가입
router.post("/", (req, res) => {
    console.log(req.body);
    return res.json(req.body);
}); 

//유저 정보 업데이트 
router.patch("/:id", (req, res)=>{
    // 업데이트 처리 
    console.log(req.body);
    return res.json(req.body);
});

// 회원 탈퇴
router.delete("/:id", (req, res)=>{
    // destory
    console.log(req.params);
    return res.json(req.params);
});

// 유저 로그인
router.post("/login", (req, res) => {
    // 로그인 
    // DB에서 검증
    // jwt 발행 
    // jwt를 전달 
    // jwt를 cookies localStroage session storage에 저장
    // 그후 요청시 마다 header에 jwt 전달
    // jwt가 유효한지 판별 
    // 응답
    return res.json(req.body);
})

//검증 시스템 




// module.exports = router;