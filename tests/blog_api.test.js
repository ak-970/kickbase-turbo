const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')



beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})



describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  // test('a specific blog is within the returned blogs', async () => {
  //   const response = await api.get('/api/blogs')

  //   const titles = response.body.map(r => r.title)
  //   expect(titles).toContain(
  //     'Go To Statement Considered Harmful'
  //   )
  // })

  test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')

    response.body.forEach(blog => {
      expect(blog.id).toBeDefined()
    })
  })
})


describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})


describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12
    }
    const token = await helper.validToken()

    await api
      .post('/api/blogs')
      .set({ Authorization: `Bearer ${token}` })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain(
      'Canonical string reduction'
    )
  })

  test('succeeds without the likes property, likes will default to 0', async () => {
    const newBlog = {
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html'
    }
    const token = await helper.validToken()

    await api
      .post('/api/blogs')
      .set({ Authorization: `Bearer ${token}` })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    expect(blogsAtEnd.find(blog => blog.title === 'TDD harms architecture').likes).toBe(0)
  })


  test('fails with status code 400 if title property is missing', async () => {
    const newBlog = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
    }
    const token = await helper.validToken()

    await api
      .post('/api/blogs')
      .set({ Authorization: `Bearer ${token}` })
      .send(newBlog)
      .expect(400)
  })


  test('fails with status code 400 if url property is missing', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      likes: 2,
    }
    const token = await helper.validToken()

    await api
      .post('/api/blogs')
      .set({ Authorization: `Bearer ${token}` })
      .send(newBlog)
      .expect(400)
  })

  test('fails with status code 401 if blog data valid but token invalid', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12
    }
    const token = await helper.invalidToken()

    await api
      .post('/api/blogs')
      .set({ Authorization: `Bearer ${token}` })
      .send(newBlog)
      .expect(401)
  })

  test('fails with status code 401 if blog data valid but token not provided', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})


describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12
    }
    const token = await helper.validToken()
    await api
      .post('/api/blogs')
      .set({ Authorization: `Bearer ${token}` })
      .send(newBlog)

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[blogsAtStart.length - 1]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

    const titles = blogsAtEnd.map(b => b.title)

    expect(titles).not.toContain(blogToDelete.title)
  })

  test('breaks without changes with status code 204 if (valid) id doesn\'t exist', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const validNonexistingId = await helper.nonExistingId()
    const token = await helper.validToken()

    await api
      .delete(`/api/blogs/${validNonexistingId}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })

  test('fails with status code 400 if id is invalid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const invalidId = '5'
    const token = await helper.validToken()

    await api
      .delete(`/api/blogs/${invalidId}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })
})


describe('updating of a blog', () => {
  test('succeeds with valid data', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToUpdate = {
      ...blogsAtStart[0],
      likes : blogsAtStart[0].likes + 1
    }

    const resultBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToUpdate)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const validNonexistingId = await helper.nonExistingId()

    const blogToUpdate = { ...blogsAtStart[0] }

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send(blogToUpdate)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const invalidId = '5'

    const blogToUpdate = { ...blogsAtStart[0] }

    await api
      .put(`/api/blogs/${invalidId}`)
      .send(blogToUpdate)
      .expect(400)
  })
})



afterAll(async () => {
  await mongoose.connection.close()
})