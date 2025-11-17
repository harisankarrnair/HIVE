const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { 
        type: String,
        required: true,
        unique: true, // Assuming you want unique emails
        // 🚩 START OF CUSTOM VALIDATION FOR DOMAIN
        validate: {
            validator: function(v) {
                // RegEx to check if the string ends with @vitstudent.ac.in (case-insensitive)
                // The pattern also ensures it's a valid email format before the domain.
                return /^[^@\s]+@vitstudent\.ac\.in$/i.test(v);
            },
            message: props => `${props.value} is not a valid VIT student email. Email must end with @vitstudent.ac.in.`
        }
        // 🚩 END OF CUSTOM VALIDATION
    },
    regNo: String,
    room: String,
    block: String,
    password: String // store hashed passwords in production
});

module.exports = mongoose.model('User', UserSchema);