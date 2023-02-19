import type OrbitConnection from '../OrbitConnection';
import { RecordingRepository } from '../Repository';

describe('Recordings Repository', () => {
  it('starts with an empty recordings collection', async () => {
    const TEST_COLLECTION = 'test-recordings';

    const mockDocs = {
      load: jest.fn(),
      get: jest.fn(),
    };

    const mockOrbitConnection = {
      orbitdb: {
        docs: jest.fn().mockImplementationOnce(() => mockDocs),
        kvstore: jest.fn(),
      },
    };

    const repository = new RecordingRepository(
      mockOrbitConnection as unknown as typeof OrbitConnection.Instance,
      TEST_COLLECTION,
      'blablabla' + `/${TEST_COLLECTION}`
    );

    const foundRecordings = await repository.find({});

    console.log('*** foundRecordings:', foundRecordings);

    expect(mockOrbitConnection.orbitdb.docs).toBeCalledTimes(1);
    expect(mockDocs.load).toBeCalledTimes(1);
    expect(mockDocs.get).toBeCalledTimes(1);
  });
});
