import {NgModule} from '@angular/core';
import {HttpClientModule, HttpHeaders} from '@angular/common/http';
import {GC_AUTH_TOKEN} from './constants';
// 1
import {Apollo, ApolloModule} from 'apollo-angular';
import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {getOperationAST} from 'graphql';
import {WebSocketLink} from 'apollo-link-ws';
import {ApolloLink} from 'apollo-link';


@NgModule({
  exports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphQLModule {
  constructor(apollo: Apollo, httpLink: HttpLink) {

    const token = localStorage.getItem(GC_AUTH_TOKEN);
    const authorization = token ? `Bearer ${token}` : null;
    const headers = new HttpHeaders();
    headers.append('Authorization', authorization);

    const uri = 'https://api.graph.cool/simple/v1/ck4fmfitn645g019835655og2';
    const http = httpLink.create({ uri });

    const ws = new WebSocketLink({
      uri: `wss://subscriptions.graph.cool/v1/ck4fmfitn645g019835655og2`,
      options: {
        reconnect: true,
        connectionParams: {
          authToken: localStorage.getItem(GC_AUTH_TOKEN),
        }
      }
    });

    // create Apollo
    apollo.create({
      link: ApolloLink.split(
        operation => {
          const operationAST = getOperationAST(operation.query, operation.operationName);
          return !!operationAST && operationAST.operation === 'subscription';
        },
        ws,
        http,
      ),
      cache: new InMemoryCache()
    });
  }
}