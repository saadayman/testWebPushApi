
import  webpush from 'web-push'
// console.log(webpush.generateVAPIDKeys())
import  express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'

const app = express()
app.use(cors({
    origin:"*"
}))
app.use(express.json())
const pushSchema  = new mongoose.Schema({
    
        "endpoint": {
            type:String,
            required:true
        },
        expirationTime: {
            type: Date, // or you can use "type: Schema.Types.Mixed" if it can be null
            default: null
          },
          keys: {
            p256dh: {
              type: String,
              required: true
            },
            auth: {
              type: String,
              required: true
            }
          }
    
})
const pushModel = mongoose.model('push_templates',pushSchema)
const connectMongo=async()=>{
    try {
    const connection_mongo =   await mongoose.connect('mongodb+srv://sayman:saad1234@cluster0.rl0sfdh.mongodb.net/PushUsers')
    
        console.log('Connect')
    } catch (error) {
        console.log(error)
    }
}

connectMongo().then(()=>{
    app.listen(process.env.PORT ||3000,()=>{
        console.log('app running on port',process.env.PORT,3000)
      })
      
})

app.post('/save/push',async(req,res,next)=>{
    console.log(req.body)
    // const pushNotification = new pushModel(req.body)
   const saved_pushNotification =  await pushModel.create(req.body)
   console.log(saved_pushNotification)
   
    res.json(saved_pushNotification)

})

app.get('/send', async (req, res) => {
    const keys = {
        publicKey: 'BOncXD2WECeZZs8Q14-0lY-12G7xgsSUyEDUocPGtmFfUeYQADWIhD1tIwtHqdgGYnNckNKZZtN_GZsNkc9lStg',
        privateKey: 'A0U6-hhsqTiI-4lXsS77kIUgsPK7-C9LXUbekz8Wltg'
    };
    let req_body =      {
        data: {
            url: "https://google.com",
            message: "Hello"
        },
        title: "saads"}
    if(req.body){
        req_body = req.body
    }
    const payload = {
        notification: {
      ...req_body
        }
    };

    try {
        const id = new mongoose.Types.ObjectId(req.query.id);
        const pushSubscription = await pushModel.findOne({ _id: id });

        if (!pushSubscription) {
            return res.status(404).json('No subscription found for the given ID');
        }

        webpush.setVapidDetails('mailto:sa467563@gmail.com', keys.publicKey, keys.privateKey);
        const res_details = await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
        res.json({
            msg:'Push Notification has been sent.',
            res:res_details
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({
            msg:'Failed to send push notification',
            error:error.message
        });
    }
});

app.get('/users',async(req,res,next)=>{
   const users = await  pushModel.find({})
res.json(users)
})

