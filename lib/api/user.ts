import { serverUrl } from "../environment";

export enum DeleteUserError {
  USER_NOT_FOUND = "User not found",
  USER_HAS_MEMORIES = "Please delete all memories before deleting your account",
  USER_HAS_CHATS = "Please delete all chats before deleting your account",
  UNKNOWN = "An unknown error occurred while deleting your account",
}

export const deleteUserAccount = async (): Promise<{ message: string }> => {
  const response = await fetch(`${serverUrl}/user/delete`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    if (
      data.error === DeleteUserError.USER_HAS_MEMORIES ||
      data.error === DeleteUserError.USER_HAS_CHATS
    ) {
      throw new Error(data.error);
    }
    throw new Error(data.error || DeleteUserError.UNKNOWN);
  }

  return response.json();
};
