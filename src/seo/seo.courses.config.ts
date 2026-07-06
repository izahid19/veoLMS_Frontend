export const coursesPageSeo = {
  title: 'Browse Courses — VeoLMS',
  description: 'Explore premium programming and web development courses...',
}

export const courseDetailSeo = (title: string, description: string) => ({
  title: `${title} — VeoLMS`,
  description: description.slice(0, 155),
})

export const studentDashboardSeo = {
  title: 'My Dashboard — VeoLMS',
  description: 'Continue learning, track your progress...',
}

export const myCoursesSeo = {
  title: 'My Courses — VeoLMS',
  description: 'All your enrolled courses in one place...',
}

export const coursePlayerSeo = (title: string) => ({
  title: `${title} — VeoLMS Player`,
  description: `Watch ${title} lessons and track your progress...`,
})
