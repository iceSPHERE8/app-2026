const bcrypt = require('bcryptjs');

const plainPassword = "明文密码"; // 替换成你想设置的密码
const saltRounds = 12; // 加密强度

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log("生成的 Hash 密码是:", hash);
    // 将打印出的这段字符串存入 account.json 的 password 字段中
});