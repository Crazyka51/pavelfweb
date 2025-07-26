export interface AnalyticsData {
  date: string
  views: number
  visitors: number
}

export async function getAnalyticsData(): Promise<AnalyticsData[]> {
  const mockData: AnalyticsData[] = [
    { date: "2024-07-01", views: 120, visitors: 80 },
    { date: "2024-07-02", views: 150, visitors: 95 },
    { date: "2024-07-03", views: 130, visitors: 85 },
    { date: "2024-07-04", views: 180, visitors: 110 },
    { date: "2024-07-05", views: 160, visitors: 100 },
    { date: "2024-07-06", views: 200, visitors: 120 },
    { date: "2024-07-07", views: 190, visitors: 115 },
  ]

  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockData
}

export async function getTopArticles(): Promise<{ title: string; views: number }[]> {
  const mockTopArticles = [
    { title: "Jak optimalizovat SEO pro malé podniky", views: 1250 },
    { title: "Nejlepší praktiky pro e-commerce", views: 980 },
    { title: "Moderní webový design v roce 2024", views: 750 },
    { title: "Digitální marketing pro začátečníky", views: 620 },
    { title: "Bezpečnost webových aplikací", views: 540 },
  ]

  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockTopArticles
}
