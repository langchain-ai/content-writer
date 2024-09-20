import { useEffect, useState } from "react";
import { getCookie, setCookie } from "@/lib/cookies";
import { USER_ID_COOKIE } from "@/constants";
import { v4 as uuidv4 } from "uuid";

export function useUser() {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userIdCookie = getCookie(USER_ID_COOKIE);

    if (userIdCookie) {
      setUserId(userIdCookie);
    } else {
      const newUserId = uuidv4();
      setCookie(USER_ID_COOKIE, newUserId);
      setUserId(newUserId);
    }
  }, []);

  return {
    userId,
  };
}
