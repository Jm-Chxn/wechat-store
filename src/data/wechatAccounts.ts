import type { WeChatAccount } from "@/types";

/**
 * 5 mock WeChat identities. The first is the admin (Auntie Mei / 美姨).
 * Avatars are generated via dicebear so they're stable, free, and don't
 * require any auth. Replace this list with a real lookup when the backend
 * exists.
 */
export const wechatAccounts: WeChatAccount[] = [
  {
    openid: "wx_admin_001",
    nicknameEn: "Auntie Mei",
    nicknameZh: "美姨",
    avatarUrl:
      "https://api.dicebear.com/7.x/personas/svg?seed=AuntieMei&backgroundColor=ffd1b3,fde0c0",
    role: "admin",
    joinedAt: "2025-09-12T08:30:00.000Z",
  },
  {
    openid: "wx_user_201",
    nicknameEn: "Wei Lin",
    nicknameZh: "林伟",
    avatarUrl:
      "https://api.dicebear.com/7.x/personas/svg?seed=WeiLin&backgroundColor=c9e7ff",
    role: "user",
    joinedAt: "2025-11-02T03:15:00.000Z",
  },
  {
    openid: "wx_user_202",
    nicknameEn: "Mei Chen",
    nicknameZh: "陈美",
    avatarUrl:
      "https://api.dicebear.com/7.x/personas/svg?seed=MeiChen&backgroundColor=ffd6e0",
    role: "user",
    joinedAt: "2025-12-21T11:42:00.000Z",
  },
  {
    openid: "wx_user_203",
    nicknameEn: "David Zhao",
    nicknameZh: "赵建国",
    avatarUrl:
      "https://api.dicebear.com/7.x/personas/svg?seed=DavidZhao&backgroundColor=d4f5d6",
    role: "user",
    joinedAt: "2026-01-08T07:05:00.000Z",
  },
  {
    openid: "wx_user_204",
    nicknameEn: "Lily Wang",
    nicknameZh: "王丽丽",
    avatarUrl:
      "https://api.dicebear.com/7.x/personas/svg?seed=LilyWang&backgroundColor=fde4a3",
    role: "user",
    joinedAt: "2026-02-19T19:50:00.000Z",
  },
];

export const accountByOpenid = (openid: string | null | undefined) =>
  openid ? wechatAccounts.find((a) => a.openid === openid) : undefined;
