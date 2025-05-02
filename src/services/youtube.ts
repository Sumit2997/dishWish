/**
 * Represents a YouTube video with a title and URL.
 */
export interface YouTubeVideo {
  /**
   * The title of the YouTube video.
   */
  title: string;
  /**
   * The URL of the YouTube video.
   */
  url: string;
}

/**
 * Asynchronously retrieves YouTube videos related to a given recipe.
 *
 * @param recipeName The name of the recipe to search for on YouTube.
 * @returns A promise that resolves to an array of YouTubeVideo objects.
 */
export async function getYouTubeVideos(recipeName: string): Promise<YouTubeVideo[]> {
  // TODO: Implement this by calling the YouTube API.

  return [
    {
      title: 'Amazing ' + recipeName + ' Recipe!',
      url: 'https://www.youtube.com/watch?v=xxxxxxxxxxx',
    },
    {
      title: 'Another Great ' + recipeName + ' Recipe',
      url: 'https://www.youtube.com/watch?v=yyyyyyyyyyy',
    },
  ];
}
