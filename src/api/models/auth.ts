import type { Profile } from "./profile";
import type { User } from "./user";

export type AuthPayload = {
  user: User;
  profiles: Profile[];
};
