import { token } from "morgan";
import { SoundcloudApi } from "./soundcloud";

describe("SoundcloudApi", function (): void {

  test("Gets token", async function (): Promise<void> {
    await SoundcloudApi.getAccessToken();

    expect(SoundcloudApi.accessToken).toBeTruthy();
    expect(SoundcloudApi.refreshToken).toBeTruthy();
    expect(SoundcloudApi.tokenExpirationTime).toBeGreaterThan(Date.now());
  });

  test("Refreshes token", async function (): Promise<void> {
    await SoundcloudApi.getAccessToken();
    await SoundcloudApi.refreshAccessToken();

    expect(SoundcloudApi.accessToken).toBeTruthy();
    expect(SoundcloudApi.refreshToken).toBeTruthy();
    expect(SoundcloudApi.tokenExpirationTime).toBeGreaterThan(Date.now());
  });
});