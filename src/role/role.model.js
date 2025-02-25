import mongoose from "mongoose";

const RoleSchema = mongoose.Schema({
    role:{
        type: String,
        required: [true, 'The role is mandatory']
    }
});

export default mongoose.model('Role', RoleSchema);