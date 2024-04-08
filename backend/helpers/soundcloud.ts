import 'dotenv/config';

const BASE_URL = "https://api.soundcloud.com";
const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const CLIENT_SECRET = process.env.SOUNDCLOUD_CLIENT_SECRET;

/** Soundcloud API Class.
 *
 * Static class for methods used to get/send to the Soundcloud API.
 *
 * https://developers.soundcloud.com/docs/api/explorer/open-api
 */

class SoundcloudApi {
  // the token for interaction with the API will be stored here.
  static accessToken: string;
  static refreshToken: string;
  static tokenExpirationTime: number;

  /** General request for Soundcloud API. */

  static async request(endpoint: string, data: any = {}, method: string = "GET"): Promise<any> {
    // if not a token route, check token
    if (endpoint !== "oauth2/token") {
      const currentTime = Date.now();
      if (currentTime > this.tokenExpirationTime) {
        await this.getAccessToken();
        // if the token is about to expire (5 min), refresh it
      } else if (currentTime > this.tokenExpirationTime - 300000) {
        await this.refreshAccessToken();
      }
    }

    const url = new URL(`${BASE_URL}/${endpoint}`);
    const headers: Record<string, string> = {
      'accept': `application/json; charset=utf-8`,
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': `OAuth ${this.accessToken || ""}`,
    };

    url.search = (method === "GET" || endpoint === "oauth2/token")
      ? new URLSearchParams(data).toString()
      : "";

    // set to undefined since the body property cannot exist on a GET method
    const body = (method !== "GET" && endpoint !== "oauth2/token")
      ? JSON.stringify(data)
      : undefined;

    const resp = await fetch(url, { method, body, headers });

    if (!resp.ok) {
      console.error("API Error:", resp.statusText, resp.status);
      const message = (await resp.json()).error.message;
      throw Array.isArray(message) ? message : [message];
    }

    return await resp.json();
  }

  // Individual API routes

  /** Get an access token. */

  static async getAccessToken(): Promise<void> {
    let res = await this.request(
      `oauth2/token`,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      },
      "POST",
    );
    this.accessToken = res.access_token;
    this.refreshToken = res.refresh_token;
    this.tokenExpirationTime = Date.now() + res.expires_in * 1000;
  }

  /** Refresh an access token */

  static async refreshAccessToken(): Promise<void> {
    let res = await this.request(
      `oauth2/token`,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
      },
      "POST",
    );
    this.accessToken = res.access_token;
    this.refreshToken = res.refresh_token;
    this.tokenExpirationTime = Date.now() + res.expires_in * 1000;
  }

  /** Get a track id from URL*/

  static async getTrackId(link: string): Promise<string> {
    const res = await this.request(`resolve`, { url: link });
    return String(res.id);
  }
}


export { SoundcloudApi };