const dummy = (blogs) => 1

const totalLikes = (blogs) => blogs.reduce((a, b) => a + b.likes, 0)

const favoriteBlog = (blogs) => blogs.reduce((a, b) => (a.likes > b.likes ? a : b), (blogs[0] || 0))

const mostBlogs = (blogs) => blogs.reduce(
  (a, b) => (
    a.blogs > blogs.filter(blog => blog.author === b.author).length ? a :
      { author: b.author, blogs: blogs.filter(blog => blog.author === b.author).length }
  ), (
    !blogs[0] ? 0 :
      { author: blogs[0].author, blogs: blogs.filter(blog => blog.author === blogs[0].author).length }
  )
)

const mostLikes = (blogs) => blogs.reduce(
  (a, b) => (
    a.likes > totalLikes(blogs.filter(blog => blog.author === b.author)) ? a :
      { author: b.author, likes: totalLikes(blogs.filter(blog => blog.author === b.author)) }
  ), (
    !blogs[0] ? 0 :
      { author: blogs[0].author, likes: totalLikes(blogs.filter(blog => blog.author === blogs[0].author)) }
  )
)


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}