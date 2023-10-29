const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  },
]

const nonExistingId = async () => {
  const blog = new Blog({
    title : 'willremovethissoon',
    author : 'Will Removethissoon',
    url : 'https://willremovethissoon.com'
  })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const validToken = async () => {

  const users = await User.find({})
  const existingTestUser = users.find(user => user.username === 'testUser')
  let user = { username : '', id : '' }

  if (existingTestUser) {
    user = {
      username: existingTestUser.username,
      id: existingTestUser._id,
    }
  } else {
    const passwordHash = await bcrypt.hash('sekret', 10)
    const testUser = new User({
      username: 'testUser',
      'name' : 'Test User',
      passwordHash
    })
    await testUser.save()

    const newTestUser = await User.findOne({ username : testUser.username })
    user = {
      username: newTestUser.username,
      id: newTestUser._id,
    }
  }

  const token = jwt.sign(
    user,
    process.env.SECRET,
    { expiresIn: 60 * 60 }
  )

  return token
}

const invalidToken = async () => {
  const token = jwt.sign(
    {
      username: 'abc',
      id: await nonExistingId(),
    },
    process.env.SECRET,
    { expiresIn: 60 * 60 }
  )
  return token
}


module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
  validToken,
  invalidToken
}