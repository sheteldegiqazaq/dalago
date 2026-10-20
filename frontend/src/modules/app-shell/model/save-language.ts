import { authControllerUpdate } from "@/shared/api/generated";
import { authToken } from "@/shared/lib/client";

/** Сохраняем выбранный язык в профиле, если пользователь вошёл. Ошибка не мешает переключению. */
export function saveLanguagePreference(code: "kk" | "ru") {
  if (authToken.get()) {
    void authControllerUpdate({ preferredLanguage: code }).catch(
      () => undefined,
    );
  }
}
