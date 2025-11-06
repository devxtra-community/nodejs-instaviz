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
                const googleId = profile.id;
                const email = profile.emails?.[0]?.value;
                const picture = profile.photos?.[0]?.value;

                const displayName =
                    typeof profile.name === "object"
                        ? `${profile.name.givenName || ""} ${profile.name.familyName || ""}`.trim()
                        : profile.displayName;

                let user = await userModel.findOne({ googleId });

                if (!user) {
                    user = await userModel.create({
                        googleId,
                        email,
                        name: displayName,
                        picture,
                    });
                }
                done(null, user)
            }
            catch (err) {
                done(err, undefined)
            }
        }
    )
)