import axios from 'axios';

export default async function handler(req, res) {
  const { limit } = req.query;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!accessToken || !pageId) {
    return res.status(500).json({ error: 'Facebook API credentials are missing' });
  }

  try {
    const response = await axios.get(`https://graph.facebook.com/v13.0/${pageId}/feed`, {
      params: {
        access_token: accessToken,
        limit: limit || 6,
        fields: 'id,message,story,created_time,permalink_url,full_picture,type,reactions.summary(true),comments.summary(true),shares',
      },
    });

    return res.status(200).json({ data: response.data.data });
  } catch (error) {
    console.error('Error fetching Facebook posts:', error);
    return res.status(500).json({ error: 'Failed to fetch Facebook posts' });
  }
}