const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("./prisma"); // ไฟล์ prisma config ของคุณ
const bcrypt = require("bcryptjs");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback", // URI ที่คุณกำหนดไว้ใน Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // ค้นหาผู้ใช้ในฐานข้อมูล
        let user = await prisma.user.findFirst({
          where: { email: profile.emails[0].value },
        });

        // ถ้าผู้ใช้ไม่มีในระบบ ให้สร้างใหม่
        if (!user) {
          const hashedPassword = await bcrypt.hash("default_password", 10); // สร้างค่าเริ่มต้น
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email: profile.emails[0].value,
              password: hashedPassword,
            },
          });
        }

        // ส่งข้อมูลผู้ใช้กลับไป
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
