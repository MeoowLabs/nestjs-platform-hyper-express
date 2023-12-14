import {
  HttpStatus,
  Logger,
  NestApplicationOptions,
  RequestMethod,
  StreamableFile,
  VersioningOptions,
} from '@nestjs/common';
import { RequestHandler, VersionValue } from '@nestjs/common/interfaces';
import { CorsOptions, CorsOptionsDelegate } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AbstractHttpAdapter } from '@nestjs/core';
import cors from 'cors';
import { LiveFile, Request, Response, RouteSpreadableArguments, Router, Server } from 'hyper-express';
import LiveDirectory from 'live-directory';

import { HyperExpressServerWrapper } from './HyperExpressServerWrapper';
import { LiveDirectoryOptions } from './LiveDirectoryOptions';

const DEFAULT_PATH: string = '';

export class HyperExpressAdapter<
  TRequest extends Request = Request,
  TResponse extends Response = Response,
> extends AbstractHttpAdapter<HyperExpressServerWrapper, TRequest, TResponse> {
  readonly #logger: Logger = new Logger(HyperExpressAdapter.name);
  protected declare instance: Server;

  public constructor(instance: Server) {
    super(instance);
  }

  public override async init(): Promise<void> {}

  public override use(...args: any[]): void {
    this.instance.use(args);
  }

  public override get(handler: RequestHandler<TRequest, TResponse>): void;
  public override get(path: string, handler: RequestHandler<TRequest, TResponse>): void;
  public override get(
    handlerOrPath: RequestHandler<TRequest, TResponse> | string,
    handler?: RequestHandler<TRequest, TResponse>,
  ): void {
    this.#buildRequestHandler(this.instance.get.bind(this.instance), handlerOrPath, handler);
  }

  public override post(handler: RequestHandler<TRequest, TResponse>): void;
  public override post(path: string, handler: RequestHandler<TRequest, TResponse>): void;
  public override post(
    handlerOrPath: RequestHandler<TRequest, TResponse> | string,
    handler?: RequestHandler<TRequest, TResponse>,
  ): void {
    this.#buildRequestHandler(this.instance.post.bind(this.instance), handlerOrPath, handler);
  }

  public override head(handler: RequestHandler<TRequest, TResponse>): void;
  public override head(path: string, handler: RequestHandler<TRequest, TResponse>): void;
  public override head(
    handlerOrPath: RequestHandler<TRequest, TResponse> | string,
    handler?: RequestHandler<TRequest, TResponse>,
  ): void {
    this.#buildRequestHandler(this.instance.head.bind(this.instance), handlerOrPath, handler);
  }

  public override delete(handler: RequestHandler<TRequest, TResponse>): void;
  public override delete(path: string, handler: RequestHandler<TRequest, TResponse>): void;
  public override delete(
    handlerOrPath: RequestHandler<TRequest, TResponse> | string,
    handler?: RequestHandler<TRequest, TResponse>,
  ): void {
    this.#buildRequestHandler(this.instance.delete.bind(this.instance), handlerOrPath, handler);
  }

  public override put(handler: RequestHandler<TRequest, TResponse>): void;
  public override put(path: string, handler: RequestHandler<TRequest, TResponse>): void;
  public override put(
    handlerOrPath: RequestHandler<TRequest, TResponse> | string,
    handler?: RequestHandler<TRequest, TResponse>,
  ): void {
    this.#buildRequestHandler(this.instance.put.bind(this.instance), handlerOrPath, handler);
  }

  public override patch(handler: RequestHandler<TRequest, TResponse>): void;
  public override patch(path: string, handler: RequestHandler<TRequest, TResponse>): void;
  public override patch(
    handlerOrPath: RequestHandler<TRequest, TResponse> | string,
    handler?: RequestHandler<TRequest, TResponse>,
  ): void {
    this.#buildRequestHandler(this.instance.patch.bind(this.instance), handlerOrPath, handler);
  }

  public override all(handler: RequestHandler<TRequest, TResponse>): void;
  public override all(path: string, handler: RequestHandler<TRequest, TResponse>): void;
  public override all(
    handlerOrPath: RequestHandler<TRequest, TResponse> | string,
    handler?: RequestHandler<TRequest, TResponse>,
  ): void {
    this.#buildRequestHandler(this.instance.all.bind(this.instance), handlerOrPath, handler);
  }

  public override options(handler: RequestHandler<TRequest, TResponse>): void;
  public override options(path: string, handler: RequestHandler<TRequest, TResponse>): void;
  public override options(
    handlerOrPath: RequestHandler<TRequest, TResponse> | string,
    handler?: RequestHandler<TRequest, TResponse>,
  ): void {
    this.#buildRequestHandler(this.instance.options.bind(this.instance), handlerOrPath, handler);
  }

  public override listen(port: string | number, callback?: (() => void) | undefined): void;
  public override listen(port: string | number, hostname: string, callback?: (() => void) | undefined): void;
  public override listen(
    port: string | number,
    hostnameOrCallback: string | (() => void) | undefined,
    callback?: (() => void) | undefined,
  ): void {
    const resolvedPort: number = typeof port === 'string' ? Number(port) : port;
    let resolvedHost: string | undefined = undefined;
    let resolvedCallback: () => void = () => {};

    if (typeof hostnameOrCallback === 'string') {
      resolvedHost = hostnameOrCallback;

      if (callback !== undefined) {
        resolvedCallback = callback;
      }
    } else {
      if (hostnameOrCallback !== undefined) {
        resolvedCallback = hostnameOrCallback;
      }
    }

    void this.instance.listen(resolvedPort, resolvedHost).then((_socket: unknown) => resolvedCallback());
  }

  public override close() {
    this.instance.close();
  }

  public override initHttpServer(_options: NestApplicationOptions) {
    this.httpServer = new HyperExpressServerWrapper(this.instance);
  }

  public override useStaticAssets(path: string, options: LiveDirectoryOptions): void {
    // const liveDirectory: LiveDirectory = new LiveDirectory(options.directory, {
    //   cache: options.cache,
    //   filter: options.filter,
    //   static: options.static,
    //   watcher: options.watcher,
    // });

    // this.instance.get(path, (request: Request, response: Response): void => {
    //   const resolvedPath: string = request.path.replace(path, '');
    //   const file: LiveFile | undefined = liveDirectory.get(resolvedPath) as LiveFile | undefined;

    //   if (file !== undefined) {
    //     const content: Buffer = file.content;

    //     if (content instanceof Buffer) {
    //       response.type(file.extension).send(content);
    //     } else {
    //       response.type(file.extension).stream(content);
    //     }
    //   } else {
    //     response.status(404).send();
    //   }
    // });
  }

  public override setViewEngine(_engine: string): void {}

  public override getRequestHostname(request: TRequest): string {
    return request.hostname;
  }

  public override getRequestMethod(request: TRequest): string {
    return request.method;
  }

  public override getRequestUrl(request: TRequest): string {
    return request.originalUrl;
  }

  public override status(response: TResponse, statusCode: number): void {
    response.status(statusCode);
  }

  public override reply(response: TResponse, body: any, statusCode?: number | undefined): void {
    if (statusCode !== undefined) {
      response.status(statusCode);
    }

    if (body === undefined || body === null) {
      response.send();
    } else if (body instanceof StreamableFile) {
      this.#processStreamableFileReply(response, body);
    } else {
      const responseContentType: string | void | string[] = response.getHeader('Content-Type');

      if (
        typeof responseContentType === 'string' &&
        !responseContentType.startsWith('application/json') &&
        body?.statusCode >= HttpStatus.BAD_REQUEST
      ) {
        this.#logger.warn(
          "Content-Type doesn't match Reply body, you might need a custom ExceptionFilter for non-JSON responses",
        );
        response.setHeader('Content-Type', 'application/json');
      }

      if (typeof body === 'object') {
        response.json(body);
      } else {
        response.send(String(body));
      }
    }
  }

  public override end(response: TResponse, message?: string | undefined): void {
    response.end(message);
  }

  public override render(response: TResponse, view: string, _options: any): void {
    response.html(view);
  }

  public override redirect(response: TResponse, statusCode: number, url: string): void {
    this.status(response, statusCode);
    response.redirect(url);
  }

  public override setErrorHandler(handler: () => unknown, _prefix?: string | undefined): void {
    this.instance.set_error_handler(handler);
  }

  public override setNotFoundHandler(handler: () => unknown, _prefix?: string | undefined): void {
    this.instance.set_not_found_handler(handler);
  }

  public override isHeadersSent(response: TResponse): boolean {
    return response.headersSent;
  }

  public override setHeader(response: TResponse, name: string, value: string) {
    response.setHeader(name, value);
  }

  public override registerParserMiddleware(_prefix?: string | undefined, _rawBody?: boolean | undefined) {}

  public override enableCors(options: CorsOptions | CorsOptionsDelegate<TRequest>): void {
    this.use(cors(options as cors.CorsOptions | cors.CorsOptionsDelegate<TRequest>));
  }

  public override createMiddlewareFactory(
    _requestMethod: RequestMethod,
  ): ((path: string, callback: Function) => any) | Promise<(path: string, callback: Function) => any> {
    throw new Error('Method not implemented.');
  }

  public override getType(): string {
    return 'hyper-express';
  }

  public override applyVersionFilter(
    _handler: () => unknown,
    _version: VersionValue,
    _versioningOptions: VersioningOptions,
  ): (req: TRequest, res: TResponse, next: () => void) => () => unknown {
    throw new Error('Method not implemented.');
  }

  #buildRequestHandler(
    hyperExpressHandler: (...args: RouteSpreadableArguments) => Router,
    handlerOrPath: RequestHandler<TRequest, TResponse> | string,
    handler?: RequestHandler<TRequest, TResponse>,
  ): void {
    let path: string;
    let requestHandler: RequestHandler<TRequest, TResponse>;

    if (typeof handlerOrPath === 'string') {
      path = handlerOrPath;
      requestHandler = handler!;
    } else {
      path = DEFAULT_PATH;
      requestHandler = handlerOrPath;
    }

    hyperExpressHandler(path, (request: Request, response: Response) => {
      response.atomic(async () => {
        request.body = await request.json();

        requestHandler(request as TRequest, response as TResponse);
      });
    });
  }

  #processStreamableFileReply(response: TResponse, body: any): void {
    const streamHeaders: {
      type: string;
      disposition: string;
      length: number;
    } = body.getHeaders();

    if (response.getHeader('Content-Type') === undefined && streamHeaders.type !== undefined) {
      response.setHeader('Content-Type', streamHeaders.type);
    }

    if (response.getHeader('Content-Disposition') === undefined && streamHeaders.disposition !== undefined) {
      response.setHeader('Content-Disposition', streamHeaders.disposition);
    }

    if (response.getHeader('Content-Length') === undefined && streamHeaders.length !== undefined) {
      response.setHeader('Content-Length', `${streamHeaders.length}`);
    }

    // pipeline(
    //   body.getStream().once('error', (err: Error) => {
    //     body.errorHandler(err, response);
    //   }),
    //   response,
    //   (err: Error) => {
    //     if (err !== undefined) {
    //       body.errorLogger(err);
    //     }
    //   },
    // );
  }
}
