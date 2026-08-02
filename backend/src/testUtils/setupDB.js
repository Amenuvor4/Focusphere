const mongoose = require('mongoose');
const { MongoMemoryServer} = require('mongodb-memory-server');


let mongoServer;

module.exports = {


    connect: async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    },

    clearDatabase: async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections){
            await collections[key].deleteMany({});
        }
    },

    closeDatabase: async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    },


}