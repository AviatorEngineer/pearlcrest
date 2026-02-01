import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema(
    {
        flatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Flat',
            required: true
        },
        flatnumber: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true,
            unique: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300 // Auto-delete after 5 minutes (300 seconds)
        },
        expiresAt: {
            type: Date,
            required: true
        },
        used: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: false
    }
);

// Index for automatic cleanup
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
