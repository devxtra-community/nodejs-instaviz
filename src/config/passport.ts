import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Profile } from "passport";
import dotenv from "dotenv";
import userModel from "../model/user.ts";

dotenv.config()

export default passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (_accessToken, _refreshToken, profile: Profile, done) => {
            try {
                const existingUser = await userModel.findOne({ googleId: profile.id });
                if (existingUser) {
                    return done(null, existingUser)
                }
                const newUser = await userModel.create({
                    googleId: profile.id,
                    name: profile.name,
                    email: profile.emails?.[0].value,
                })
                done(null, newUser)
            }
            catch (err) {
                done(err, undefined)
            }
        }
    )
)