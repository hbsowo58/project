const express = require('express');
const { route } = require('./user');
const router = express.Router();


//전체 방 가져오기 
router.get("/", ( req, res) => {
    return res.json({test: "test"});
});

// 방 정보 받아오기 
router.get("/:id", ( req, res) => {
    return res.json({test: "test"});
});

//방 정보 작성
router.post("/", (req, res) => {
    console.log(req.body);
    return res.json(req.body);
});

//방 정보 업데이트(기본정보)
router.patch("/:id", (req, res)=>{
    // 업데이트 처리 
    console.log(req.body);
    return res.json(req.body);
});

//방 삭제 
router.delete("/:id", (req, res)=>{
    // destory
    console.log(req.params);
    return res.json(req.params);
});

//방 option 정보 업데이트하기 
router.patch("/:id/option", (req, res) => {
    return res.json(req.body);
})

//방 image 정보 업데이트하기
router.patch("/:id/image", (req, res) => {
    // 기본의 파일들은 삭제처리해주고 새로 업로드한다.
    // 파일로 이동 -> 삭제 -> 업로드
    return res.json(req.body);
})


// module.exports = router;