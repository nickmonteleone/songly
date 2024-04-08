import { SoundcloudApi } from "./soundcloud";

describe("SoundcloudApi", function (): void {

  beforeAll(async function (): Promise<void> {
    await SoundcloudApi.getAccessToken();
  });

  test("Gets token", async function (): Promise<void> {
    expect(SoundcloudApi.accessToken).toBeTruthy();
    expect(SoundcloudApi.refreshToken).toBeTruthy();
    expect(SoundcloudApi.tokenExpirationTime).toBeGreaterThan(Date.now());
  });

  test("Refreshes token", async function (): Promise<void> {
    await SoundcloudApi.refreshAccessToken();

    expect(SoundcloudApi.accessToken).toBeTruthy();
    expect(SoundcloudApi.refreshToken).toBeTruthy();
    expect(SoundcloudApi.tokenExpirationTime).toBeGreaterThan(Date.now());
  });

  test("Gets track id", async function (): Promise<void> {
    const link = 'https://soundcloud.com/daftpunkofficialmusic/get-lucky';
    const id = await SoundcloudApi.getTrackId(link);

    expect(id).toEqual('254111945');
  });

  test("Gets stream URL", async function (): Promise<void> {
    const id = '254111945';
    const url = await SoundcloudApi.getStreamUrl(id);

    expect(url).toBeTruthy();
  });
});