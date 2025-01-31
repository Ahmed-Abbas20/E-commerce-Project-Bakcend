//deleted
//deleted
const mongoose=require('mongoose');

const ProPurchasedByUserSchema=mongoose.Schema({

	purchaseRelation:{
			customerId:{ type:mongoose.Schema.ObjectId,required:true },
			productId:{type:mongoose.Schema.ObjectId ,required:true }
			}
	
}, {
    timestamps: true,
})

module.exports=mogoose.model("ProPurchasedByUser",ProPurchasedByUserSchema);