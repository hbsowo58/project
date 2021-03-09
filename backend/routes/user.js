const express = require("express");
const router = express.Router();
const db = require("../models/index");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { upload } = require("../utils/multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");
// /api/user
//유저의 기본 기능
// 유저 정보

router.get("/:id", async (req, res) => {
    try {
        const result = await db["user"].findOne({
            attributes: [
                "id",
                "name",
                "email",
                "profile",
                "type",
                "createdAt",
                "updatedAt",
            ],
            where: {
                id: req.params.id,
            },
        });
        console.log(result);
        return res.json(result);
    } catch (error) {
        console.log(error);
        return res.json({ status: "ERROR" });
    }
});

//유저 회원가입1
// 필요한 요구 정보들
// name, email, password
// profile을 업로드해야 하므로
// 기본 type admin, seller, user
// 아무것도 없을 경우 기본은 user
router.post("/", async (req, res) => {
    try {
        console.log(req.body);
        const { name, email, password, type } = req.body;
        // bcrypt코드는 그냥 전달해주기
        const hashedPassword = await hashPassword(password);
        const result = await db["user"].create({
            name,
            email,
            password: hashedPassword,
            type,
        });
        console.log(result);
        return res.json({ stauts: "OK" });
    } catch (error) {
        console.log(error);
        return res.json({ status: "ERROR" });
    }
});

//유저 정보 업데이트
router.patch("/:id", async (req, res) => {
    try {
        const { name, password, type } = req.body;
        // password를 받아와서 검증 ->
        // 검증에 성공시 업데이트 처리
        const userInformation = await db["user"].findOne({
            where: {
                id: req.params.id,
            },
        });
        console.log(userInformation.dataValues);

        const result = comparePassword(
            password,
            userInformation.dataValues.password
        );

        if (result) {
            const update = await db["user"].update(
                {
                    name: name,
                    type: type,
                },
                {
                    where: {
                        id: req.params.id,
                    },
                }
            );
            return res.json({ stauts: "OK" });
        } else {
            return res.json({ status: "ERROR" });
        }
    } catch (error) {
        console.log(error);
        return res.json({ status: "ERROR" });
    }
});

router.get("/:id/profile", async (req, res) => {
    try {

        // 주소로부터 image를 가져온다
        const userInformation = await db["user"].findOne({
            attributes: ["id", "profile"],
            where: {
                id: req.params.id
            }
        });
        console.log(userInformation);
        if (userInformation.dataValues && userInformation.dataValues.profile) {
            // 이미지 바로 보이게 하기
            res.set('Content-Disposition', `inline; filename=profile.png`);
            const file = fs.createReadStream(`uploads/${userInformation.dataValues.profile}`);
            return file.pipe(res);
        } else {
            return res.json({ status: "ERROR" });
        }
    } catch (error) {
        console.log(error);
        return res.json({ status: "ERROR" });
    }
})
// 프로필업로드
router.post("/:id/profile", upload.single("profile"), async (req, res) => {
    // 업로드는 먼저 middleware 로 진행
    // DB에서 profile 정보를 가져와서
    // 기존에 있던 주소를 가져와서 삭제하고
    // 새로온 파일명으로 업데이트한다.
    try {
        console.log(req.params.id);
        const userInformation = await db["user"].findOne({
            where: {
                id: req.params.id,
            },
        });
        console.log(userInformation.dataValues);
        if (userInformation.dataValues && userInformation.dataValues.profile) {
            // 기존의 프로필 삭제
            console.log(userInformation.dataValues.profile);

            fs.unlink(`uploads/${userInformation.dataValues.profile}`, function (error) {
                if (error) {
                    console.log(error);
                }
            });

        }
        await db["user"].update(
            {
                profile: req.file.filename,
            },
            {
                where: {
                    id: req.params.id,
                },
            }
        );
        return res.json({ stauts: "OK" });
    } catch (error) {
        console.log(error);
        return res.json({ status: "ERROR" });
    }
});

// 회원 탈퇴
router.delete("/:id", async (req, res) => {
    try {
        //  deletedAt을 활용
        // paranoid true option으로 인해 실제 데이터가 삭제되지는 않고 deletedAt에 표시된다
        const result = await db["user"].destroy({
            where: {
                id: req.params.id
            }
        })
    } catch (error) {
        console.log(error);
        return res.json({ status: "ERROR" });
    }
});

// 유저 로그인2
router.post("/login", async (req, res) => {

    // 로그인
    // DB에서 검증
    // jwt 발행
    // jwt를 전달
    // jwt를 cookies localStroage session storage에 저장
    // 그후 요청시 마다 header에 jwt 전달
    // jwt가 유효한지 판별
    // 응답
    try {
        console.log(req.body);
        const { email, password } = req.body;

        // 암호화된 비밀번호를 가져온다.
        const userData = await db["user"].findOne({
            attributes: ["id", "password", "name"],
            where: {
                email: email,
            },
        });
        console.log(userData);
        const hashedPassword = userData.dataValues.password;
        console.log(userData);
        // 비밀번호와 암호화된 비밀번호를 대조해야합니다
        const compareResult = await comparePassword(password, hashedPassword);
        console.log(compareResult);
        // 로그인 검증시
        if (compareResult) {
            const token = jwt.sign({
                id: userData.dataValues.id
            }, "ssafy", {
                expiresIn: "0.5m"
            });

            return res.json({
                resultCode: 200,
                token: token
            })
        }

    } catch (error) {
        console.log(error);
        return res.json({ status: "ERROR" });
    }
});

//검증 시스템

module.exports = router;
