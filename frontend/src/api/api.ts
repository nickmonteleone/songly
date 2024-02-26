const BASE_URL = "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to the API.
 */

class SonglyApi {
  // the token for interactive with the API will be stored here.
  // temp admin token for development
  static token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJ1c2VybmFtZSI6InRlc3RhZG1pbiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTcwODg5MTUwNX0." +
    "V_FmL2R6sgN02Blq660pS9bDz4DNtO0e9akM88COT6E";

  static async request(endpoint: string, data: any = {}, method: string = "GET"): Promise<any> {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    const headers:Record<string,string> = {
      authorization: `Bearer ${SonglyApi.token}`,
      'content-type': 'application/json',
    };

    url.search = (method === "GET")
      ? new URLSearchParams(data).toString()
      : "";

    // set to undefined since the body property cannot exist on a GET method
    const body = (method !== "GET")
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

  /** Get the current user. */

  static async getCurrentUser(username: string): Promise<any> {
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  /** Get playlists (filtered by name if not undefined) */

  static async getPlaylists(): Promise<any> {
    let res = await this.request("playlists");
    return res.playlists;
  }

  /** Get details on a playlist by handle. */

  static async getPlaylist(handle: string | void): Promise<any> {
    let res = await this.request(`companies/${handle}`);
    return res.playlist;
  }

  /** Get list of songs (filtered by title if not undefined) */

  static async getSongs(title: string | void): Promise<any> {
    let res = await this.request("songs", { title });
    return res.songs;
  }

  /** Get token for login from username, password. */

  static async login(data: any): Promise<any> {
    let res = await this.request(`auth/token`, data, "POST");
    return res.token;
  }

  /** Signup for site. */

  static async signup(data: any): Promise<any> {
    let res = await this.request(`auth/register`, data, "POST");
    return res.token;
  }

  /** Save user profile page. */

  static async saveProfile(username:string, data:any): Promise<any> {
    let res = await this.request(`users/${username}`, data, "PATCH");
    return res.user;
  }
}


export default SonglyApi;