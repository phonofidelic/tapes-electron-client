import { rm, readdir } from 'fs/promises'
import path from 'path'
import { db } from '../db-orbit'
import { AppDatabase } from '../AppDatabase'

async function rmOrbitDirs() {
  const orbitDirs = await readdir('orbitdb')

  for await (const dir of orbitDirs) {
    if (/test_/.test(dir)) {
      await rm(path.resolve('orbitdb', dir), { recursive: true, force: true })
    }
  }
}

describe('Database', () => {
  let testDb: AppDatabase;

  beforeAll(async () => {
    try {
      testDb = await db.init()
    } catch (err) {
      console.error('Could not initiate test DB:', err)

      if (err.code === 'ERR_LOCK_EXISTS') {
        try {
          console.log('Lock exists, removing test-ipfs folder...')
          // await testDb.close()
          await rm('ipfs-test', { recursive: true, force: true })
          // await rm('orbitdb/test', { recursive: true, force: true })
        } catch (err) {
          console.error('Could not remove ipfs-test:', err)
        }
      }
    }
  })

  afterAll(async () => {
    await testDb.close()

    try {
      await rm('ipfs-test', { recursive: true, force: true })
      // await rm('orbitdb/test_*', { recursive: true, force: true })
      await rmOrbitDirs()
    } catch (err) {
      console.error('Could not remove ipfs-test:', err)
    }
    console.log('*** Done ***')
  })

  it('starts with an empty recordings collection', async () => {
    const foundRecordings = await testDb.find('recordings', {})

    expect(foundRecordings.length).toBe(0)
  })

  it('can add a recording', async () => {
    await testDb.add('recordings', { _id: '123', value: 'test1' })
    const foundRecordings = await testDb.find('recordings', {})

    expect(foundRecordings.length).toBe(1)
  })

  it('can find a recording by query', async () => {
    await testDb.add('recordings', { _id: '456', value: 'test2' })

    const allRecordings = await testDb.find('recordings', {})
    const foundRecordings = await testDb.find('recordings', { value: 'test2' })

    expect(allRecordings.length).toBe(2)
    expect(foundRecordings.length).toBe(1)
  })

  it('can find a recording by id', async () => {
    const foundRecording = await testDb.findById('recordings', '123')

    expect(foundRecording).toMatchObject({ _id: '123', value: 'test1' })
  })

  it('can update a recording', async () => {
    const updatedRecording = await testDb.update('recordings', '123', { value: 'updated!' })

    expect(updatedRecording).toMatchObject({ _id: '123', value: 'updated!' })
  })

  it('can delete a recording', async () => {
    const deletedRecordingId = await testDb.delete('recordings', '123')
    const allRecordings = await testDb.find('recordings', {})
    expect(allRecordings.length).toBe(1)
    expect(deletedRecordingId).toEqual('123')
  })
})