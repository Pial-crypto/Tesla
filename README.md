# Dhaka Tesla Pool
Prisma 8 — Final Command Sequence
1. contract.prisma edit করো
src/prisma/contract.prisma
2. Contract generate/update
npx prisma contract emit
3. Migration তৈরি
npx prisma migration plan --name <change-name>

উদাহরণ:

npx prisma migration plan --name add-users-table
4. Migration check
npx prisma migration list
5. Migration apply
npx prisma db migrate
6. Status check
npx prisma migration status

Expected:

✔ Up to date
🆕 Fresh/Empty Database হলে

একদম নতুন database হলে:

npx prisma db init

তারপর:

npx prisma migration status
🔍 Database verify
npx prisma db verify
🗄️ PostgreSQL দেখতে
docker exec -it tesla-postgres psql -U tesla -d tesla_pool

তারপর:

\d "User"