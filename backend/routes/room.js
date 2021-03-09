const express = require("express");
const { verifyToken } = require("../utils/jwt");
const router = express.Router();
const db = require("../models/index");
const { sequelize } = require("../models")
const Seq = require("sequelize");
const { upload } = require("../utils/multer");
const fs = require("fs");
//api/room
//전체 방 가져오기

router.get("/", async (req, res) => {
    try {
        const roomInformations = await db["room"].findAll({
            include: [{ model: db["room_image"] }, { model: db["room_option"] }],
            where: {
                location: {
                    [Seq.Op.like]: req.query.search ? `%${req.query.search}%` : `%%`
                }
            }
        });
        console.log(req.url);
        console.log(req.hostname);
        console.log(req.get("host"));
        // 해당 주소로 가게되면 이미지 주소를 보내준다.
        const makeImageUrl = (id) =>
            `${req.protocol}://${req.get("host")}/api/room/image/${id}`;
        //   console.log(req.protocol + '://' + req.get('host') + req.originalUrl)
        const plainInformation = roomInformations.map((el) => el.get({ plain: true }));
        // room image가 있을 경우 
        // 이미지 url 생성 
        const result = plainInformation.map(li => {
            if (li['room_images'].length) {
                li['room_images'] = li['room_images'].map(image => {
                    return { ...image, url: makeImageUrl(image.id) }
                });
            }
            return li;
        })

        return res.json(result);
    } catch (error) {
        console.log(error);
        return res.json({ status: "ERROR" });
    }
});

// 방 정보 받아오기
router.get("/:id", async (req, res) => {
    const result = await db["room"].findOne({
        include: [{ model: db["room_image"] }, { model: db["room_option"] }],
        where: {
            id: req.params.id,
        },
    });
    console.log(result);
    return res.json({ test: "test" });
});


router.get('/image/:id', async (req, res) => {
    try {

        // 주소로부터 image를 가져온다
        const roomImage = await db["room_image"].findOne({
            // attributes:["id","profile"],
            where: {
                id: req.params.id
            }
        });
        console.log(roomImage);
        if (roomImage.dataValues && roomImage.dataValues['file_name']) {
            // 이미지 바로 보이게 하기
            res.set('Content-Disposition', `inline; filename=profile.png`);
            const file = fs.createReadStream(`uploads/${roomImage.dataValues['file_name']}`);
            return file.pipe(res);
        } else {
            return res.json({ status: "ERROR" });
        }
    } catch (error) {
        console.log(error);
        return res.json({ status: "ERROR" });
    }
})
//   옵션 받아오기

// router.post("/", verifyToken, (req, res) => {
// 연속으로 데이터를 넣어야 하기 때문에
// 트랜잭션을 활용한다.

// 필요한 정보
// title, content, room_type, room_size, location, latitude, longitude, user_id

//이미지
//이미지 URL을 넣는다
// 주소 post

// 옵션
// item
//방 정보 작성
router.post("/", verifyToken, upload.array("room_image"), async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            title,
            content,
            room_type,
            room_size,
            location,
            latitude,
            longitude,
            item,
        } = req.body;

        const room = await db["room"].create(
            {
                title,
                content,
                room_type,
                room_size,
                location,
                latitude,
                longitude,
                user_id: req.decoded.id,
            },
            { transaction: transaction }
        );

        console.log(req.body);
        // item이 하나만 올때는 일반 string으로 넘어오고
        // item이 여러개 일때는 배열로 넘어온다.
        if (item) {
            if (typeof item === "string") {
                await db["room_option"].create(
                    {
                        item: item,
                        room_id: room.dataValues.id,
                    },
                    { transaction: transaction }
                );
            } else {
                await Promise.all(
                    item.map(async (li) => {
                        await db["room_option"].create(
                            {
                                item: li,
                                room_id: room.dataValues.id,
                            },
                            { transaction: transaction }
                        );
                    })
                );
            }
        }
        if (req.files) {
            await Promise.all(
                req.files.map(async (li) => {
                    await db["room_image"].create(
                        {
                            file_name: li.filename,
                            original_file_name: li.originalname,
                            room_id: room.dataValues.id,
                        },
                        { transaction: transaction }
                    );
                })
            );
        }

        console.log(req.body);
        transaction.commit();
        // return res.json(req.body);
        return res.json({ stauts: "OK" });
    } catch (error) {
        console.log(error);
        transaction.rollback();
        // 롤백함과 동시에 multer의 파일들도 지워준다.
        // console.log(req.files);
        if (req.files) {
            req.files.forEach((li) => {
                console.log(li.path);
                fs.unlink(li.path, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        }
        return res.json({ status: "ERROR" });
    }
});
// 방 이미지들 보여주는 부분

//방 정보 업데이트(기본정보)
router.patch("/:id", (req, res) => {
    // 업데이트 처리
    console.log(req.body);
    return res.json(req.body);
});

//방 삭제
router.delete("/:id", (req, res) => {
    // destory
    console.log(req.params);
    return res.json(req.params);
});

//방 option 정보 업데이트하기
router.patch("/:id/option", (req, res) => { });

//방 image 정보 업데이트하기
router.patch("/:id/image", (req, res) => {
    // 기본의 파일들은 삭제처리해주고 새로 업로드한다.
    // 파일로 이동 -> 삭제 -> 업로드
});

module.exports = router;
