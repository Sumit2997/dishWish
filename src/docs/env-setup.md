# Environment Variable Setup

To properly use features like the YouTube video suggestions, you need to set up environment variables for your application.

## YouTube API Setup

1. Create a `.env.local` file in the root directory of the project
2. Add the following line to the file, replacing `your_youtube_api_key_here` with your actual YouTube Data API v3 key:

```
YOUTUBE_API_KEY=your_youtube_api_key_here
```

3. If using in production, make sure to add the environment variable to your deployment platform.

## Getting a YouTube API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the YouTube Data API v3
4. Create credentials to get an API key
5. Restrict the API key to only the YouTube Data API v3 to improve security

For more detailed instructions, see the [official Google documentation](https://developers.google.com/youtube/v3/getting-started).

## Notes

- Never commit your `.env.local` file to version control
- The application will fall back to showing generic YouTube search links if the API key is not available or if there's an error with the API call 