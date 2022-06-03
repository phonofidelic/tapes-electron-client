import { rm, readdir } from 'fs/promises'
import path from 'path'
import { db } from '../db-orbit'
import { AppDatabase } from '../AppDatabase.interface'

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
  let test1Id: string;

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
    test1Id = await testDb.add('recordings', { value: 'test1' })
    const foundRecordings = await testDb.find('recordings', {})

    expect(foundRecordings.length).toBe(1)
  })

  it('can find a recording by query', async () => {
    await testDb.add('recordings', { value: 'test2' })

    const allRecordings = await testDb.find('recordings', {})
    const foundRecordings = await testDb.find('recordings', { value: 'test2' })
    expect(allRecordings.length).toBe(2)
    expect(foundRecordings.length).toBe(1)
  })

  it('can find a recording by id', async () => {
    const foundRecording = await testDb.findById('recordings', test1Id)

    expect(foundRecording).toMatchObject({ value: 'test1' })
  })

  it('can update a recording', async () => {
    const updatedRecording = await testDb.update('recordings', test1Id, { value: 'updated!' })

    expect(updatedRecording).toMatchObject({ value: 'updated!' })
  })

  it('can delete a recording', async () => {
    const deletedRecordingId = await testDb.delete('recordings', test1Id)
    const allRecordings = await testDb.find('recordings', {})
    expect(allRecordings.length).toBe(1)
    expect(deletedRecordingId).toEqual(test1Id)
  })
})