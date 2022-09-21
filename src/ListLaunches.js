import {
  ApolloClient,
  gql,
  InMemoryCache,
  NetworkStatus,
  useQuery
} from '@apollo/client';
import {offsetLimitPagination} from '@apollo/client/utilities';
import ColorHash from 'color-hash';
import {useState} from 'react';
import {InView} from 'react-intersection-observer';

const colorHash = new ColorHash();

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        launchesPast: offsetLimitPagination()
      }
    }
  }
});

const client = new ApolloClient({
  uri: 'https://api.spacex.land/graphql/',
  cache
});

const LIST_LAUNCHES = gql`
  query ListLaunches($offset: Int!, $limit: Int!) {
    launches: launchesPast(
      offset: $offset
      limit: $limit
      sort: "launch_date_utc"
      order: "desc"
    ) {
      id
      mission_name
      rocket {
        rocket_name
      }
    }
  }
`;

export default function ListLaunches() {
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const {data, networkStatus, error, fetchMore, variables} = useQuery(
    LIST_LAUNCHES,
    {
      client,
      notifyOnNetworkStatusChange: true,
      variables: {
        offset: 0,
        limit: 10
      }
    }
  );

  if (networkStatus === NetworkStatus.loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gridGap: 20
        }}
      >
        {data.launches.map((launch) => (
          <div
            key={launch.id}
            style={{
              padding: 12,
              background: colorHash.hex(launch.id.toString())
            }}
          >
            <h2>{launch.mission_name}</h2>
            <h3>{launch.rocket.rocket_name}</h3>
          </div>
        ))}
      </div>
      {networkStatus !== NetworkStatus.fetchMore &&
        data.launches.length % variables.limit === 0 &&
        !fullyLoaded && (
          <InView
            onChange={async (inView) => {
              if (inView) {
                const result = await fetchMore({
                  variables: {
                    offset: data.launches.length
                  }
                });
                setFullyLoaded(!result.data.launches.length);
              }
            }}
          />
        )}
    </>
  );
}
