-----------Server---------------
#Step 1
npm i
npm i passport passport-google-oauth20 express-session

#Step 2
docker compose up -d

docker exec -it PM25-db_test bash
psql -U PM25_postgres -d mydb
REVOKE CONNECT ON DATABASE mydb FROM public;
    REVOKE ALL ON SCHEMA public FROM PUBLIC;
    CREATE USER appuser WITH PASSWORD '1234';
    CREATE SCHEMA drizzle;
    GRANT ALL ON DATABASE mydb TO appuser;
    GRANT ALL ON SCHEMA public TO appuser;
    GRANT ALL ON SCHEMA drizzle TO appuser;


#Step 3
เปิด Dbeaver สร้าง database postgres
--อย่าลืมเปลี่ยน DATABASE_URL ใน .env ให้ตรงกัน--

#step 4
npx prisma migrate dev --name ชื่อ database




// Doc ใช้ในการสร้างและอัพเดตฐานข้อมูล
npx prisma migrate dev --name ชื่อ database

// update Scheme
npx prisma db push // no log
npx prisma migrate dev --create-only
npx prisma migrate dev --name pชื่อ database

//
อัพเดต Prisma schema
npx prisma migrate dev