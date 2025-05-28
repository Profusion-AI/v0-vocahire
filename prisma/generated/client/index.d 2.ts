
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model InterviewSession
 * 
 */
export type InterviewSession = $Result.DefaultSelection<Prisma.$InterviewSessionPayload>
/**
 * Model Transcript
 * 
 */
export type Transcript = $Result.DefaultSelection<Prisma.$TranscriptPayload>
/**
 * Model Feedback
 * 
 */
export type Feedback = $Result.DefaultSelection<Prisma.$FeedbackPayload>
/**
 * Model UsageEvent
 * 
 */
export type UsageEvent = $Result.DefaultSelection<Prisma.$UsageEventPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserRole: {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const InterviewStatus: {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  FEEDBACK_GENERATED: 'FEEDBACK_GENERATED'
};

export type InterviewStatus = (typeof InterviewStatus)[keyof typeof InterviewStatus]

}

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

export type InterviewStatus = $Enums.InterviewStatus

export const InterviewStatus: typeof $Enums.InterviewStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.interviewSession`: Exposes CRUD operations for the **InterviewSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InterviewSessions
    * const interviewSessions = await prisma.interviewSession.findMany()
    * ```
    */
  get interviewSession(): Prisma.InterviewSessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transcript`: Exposes CRUD operations for the **Transcript** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Transcripts
    * const transcripts = await prisma.transcript.findMany()
    * ```
    */
  get transcript(): Prisma.TranscriptDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.feedback`: Exposes CRUD operations for the **Feedback** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Feedbacks
    * const feedbacks = await prisma.feedback.findMany()
    * ```
    */
  get feedback(): Prisma.FeedbackDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.usageEvent`: Exposes CRUD operations for the **UsageEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UsageEvents
    * const usageEvents = await prisma.usageEvent.findMany()
    * ```
    */
  get usageEvent(): Prisma.UsageEventDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.8.2
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    InterviewSession: 'InterviewSession',
    Transcript: 'Transcript',
    Feedback: 'Feedback',
    UsageEvent: 'UsageEvent'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "interviewSession" | "transcript" | "feedback" | "usageEvent"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      InterviewSession: {
        payload: Prisma.$InterviewSessionPayload<ExtArgs>
        fields: Prisma.InterviewSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InterviewSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InterviewSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>
          }
          findFirst: {
            args: Prisma.InterviewSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InterviewSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>
          }
          findMany: {
            args: Prisma.InterviewSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>[]
          }
          create: {
            args: Prisma.InterviewSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>
          }
          createMany: {
            args: Prisma.InterviewSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InterviewSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>[]
          }
          delete: {
            args: Prisma.InterviewSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>
          }
          update: {
            args: Prisma.InterviewSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>
          }
          deleteMany: {
            args: Prisma.InterviewSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InterviewSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InterviewSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>[]
          }
          upsert: {
            args: Prisma.InterviewSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>
          }
          aggregate: {
            args: Prisma.InterviewSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInterviewSession>
          }
          groupBy: {
            args: Prisma.InterviewSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<InterviewSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.InterviewSessionCountArgs<ExtArgs>
            result: $Utils.Optional<InterviewSessionCountAggregateOutputType> | number
          }
        }
      }
      Transcript: {
        payload: Prisma.$TranscriptPayload<ExtArgs>
        fields: Prisma.TranscriptFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TranscriptFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TranscriptPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TranscriptFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TranscriptPayload>
          }
          findFirst: {
            args: Prisma.TranscriptFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TranscriptPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TranscriptFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TranscriptPayload>
          }
          findMany: {
            args: Prisma.TranscriptFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TranscriptPayload>[]
          }
          create: {
            args: Prisma.TranscriptCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TranscriptPayload>
          }
          createMany: {
            args: Prisma.TranscriptCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TranscriptCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TranscriptPayload>[]
          }
          delete: {
            args: Prisma.TranscriptDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TranscriptPayload>
          }
          update: {
            args: Prisma.TranscriptUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TranscriptPayload>
          }
          deleteMany: {
            args: Prisma.TranscriptDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TranscriptUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TranscriptUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TranscriptPayload>[]
          }
          upsert: {
            args: Prisma.TranscriptUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TranscriptPayload>
          }
          aggregate: {
            args: Prisma.TranscriptAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTranscript>
          }
          groupBy: {
            args: Prisma.TranscriptGroupByArgs<ExtArgs>
            result: $Utils.Optional<TranscriptGroupByOutputType>[]
          }
          count: {
            args: Prisma.TranscriptCountArgs<ExtArgs>
            result: $Utils.Optional<TranscriptCountAggregateOutputType> | number
          }
        }
      }
      Feedback: {
        payload: Prisma.$FeedbackPayload<ExtArgs>
        fields: Prisma.FeedbackFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FeedbackFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FeedbackFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>
          }
          findFirst: {
            args: Prisma.FeedbackFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FeedbackFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>
          }
          findMany: {
            args: Prisma.FeedbackFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>[]
          }
          create: {
            args: Prisma.FeedbackCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>
          }
          createMany: {
            args: Prisma.FeedbackCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FeedbackCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>[]
          }
          delete: {
            args: Prisma.FeedbackDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>
          }
          update: {
            args: Prisma.FeedbackUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>
          }
          deleteMany: {
            args: Prisma.FeedbackDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FeedbackUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FeedbackUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>[]
          }
          upsert: {
            args: Prisma.FeedbackUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>
          }
          aggregate: {
            args: Prisma.FeedbackAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFeedback>
          }
          groupBy: {
            args: Prisma.FeedbackGroupByArgs<ExtArgs>
            result: $Utils.Optional<FeedbackGroupByOutputType>[]
          }
          count: {
            args: Prisma.FeedbackCountArgs<ExtArgs>
            result: $Utils.Optional<FeedbackCountAggregateOutputType> | number
          }
        }
      }
      UsageEvent: {
        payload: Prisma.$UsageEventPayload<ExtArgs>
        fields: Prisma.UsageEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UsageEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UsageEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageEventPayload>
          }
          findFirst: {
            args: Prisma.UsageEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UsageEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageEventPayload>
          }
          findMany: {
            args: Prisma.UsageEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageEventPayload>[]
          }
          create: {
            args: Prisma.UsageEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageEventPayload>
          }
          createMany: {
            args: Prisma.UsageEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UsageEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageEventPayload>[]
          }
          delete: {
            args: Prisma.UsageEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageEventPayload>
          }
          update: {
            args: Prisma.UsageEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageEventPayload>
          }
          deleteMany: {
            args: Prisma.UsageEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UsageEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UsageEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageEventPayload>[]
          }
          upsert: {
            args: Prisma.UsageEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageEventPayload>
          }
          aggregate: {
            args: Prisma.UsageEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsageEvent>
          }
          groupBy: {
            args: Prisma.UsageEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsageEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.UsageEventCountArgs<ExtArgs>
            result: $Utils.Optional<UsageEventCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    interviewSession?: InterviewSessionOmit
    transcript?: TranscriptOmit
    feedback?: FeedbackOmit
    usageEvent?: UsageEventOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    feedbacks: number
    interviewSessions: number
    usageEvents: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    feedbacks?: boolean | UserCountOutputTypeCountFeedbacksArgs
    interviewSessions?: boolean | UserCountOutputTypeCountInterviewSessionsArgs
    usageEvents?: boolean | UserCountOutputTypeCountUsageEventsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountFeedbacksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FeedbackWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountInterviewSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InterviewSessionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUsageEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsageEventWhereInput
  }


  /**
   * Count Type InterviewSessionCountOutputType
   */

  export type InterviewSessionCountOutputType = {
    feedbacks: number
    transcripts: number
  }

  export type InterviewSessionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    feedbacks?: boolean | InterviewSessionCountOutputTypeCountFeedbacksArgs
    transcripts?: boolean | InterviewSessionCountOutputTypeCountTranscriptsArgs
  }

  // Custom InputTypes
  /**
   * InterviewSessionCountOutputType without action
   */
  export type InterviewSessionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSessionCountOutputType
     */
    select?: InterviewSessionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InterviewSessionCountOutputType without action
   */
  export type InterviewSessionCountOutputTypeCountFeedbacksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FeedbackWhereInput
  }

  /**
   * InterviewSessionCountOutputType without action
   */
  export type InterviewSessionCountOutputTypeCountTranscriptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TranscriptWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    credits: Decimal | null
  }

  export type UserSumAggregateOutputType = {
    credits: Decimal | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    clerkId: string | null
    role: $Enums.UserRole | null
    credits: Decimal | null
    resumeJobTitle: string | null
    resumeSkills: string | null
    resumeExperience: string | null
    resumeEducation: string | null
    resumeAchievements: string | null
    resumeFileUrl: string | null
    jobSearchStage: string | null
    linkedinUrl: string | null
    acceptedTermsAt: Date | null
    acceptedPrivacyAt: Date | null
    dataRetentionOverride: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    premiumExpiresAt: Date | null
    premiumSubscriptionId: string | null
    stripeCustomerId: string | null
    isPremium: boolean | null
    email: string | null
    image: string | null
    name: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    clerkId: string | null
    role: $Enums.UserRole | null
    credits: Decimal | null
    resumeJobTitle: string | null
    resumeSkills: string | null
    resumeExperience: string | null
    resumeEducation: string | null
    resumeAchievements: string | null
    resumeFileUrl: string | null
    jobSearchStage: string | null
    linkedinUrl: string | null
    acceptedTermsAt: Date | null
    acceptedPrivacyAt: Date | null
    dataRetentionOverride: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    premiumExpiresAt: Date | null
    premiumSubscriptionId: string | null
    stripeCustomerId: string | null
    isPremium: boolean | null
    email: string | null
    image: string | null
    name: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    clerkId: number
    role: number
    credits: number
    resumeJobTitle: number
    resumeSkills: number
    resumeExperience: number
    resumeEducation: number
    resumeAchievements: number
    resumeFileUrl: number
    jobSearchStage: number
    linkedinUrl: number
    acceptedTermsAt: number
    acceptedPrivacyAt: number
    dataRetentionOverride: number
    createdAt: number
    updatedAt: number
    premiumExpiresAt: number
    premiumSubscriptionId: number
    stripeCustomerId: number
    isPremium: number
    email: number
    image: number
    name: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    credits?: true
  }

  export type UserSumAggregateInputType = {
    credits?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    clerkId?: true
    role?: true
    credits?: true
    resumeJobTitle?: true
    resumeSkills?: true
    resumeExperience?: true
    resumeEducation?: true
    resumeAchievements?: true
    resumeFileUrl?: true
    jobSearchStage?: true
    linkedinUrl?: true
    acceptedTermsAt?: true
    acceptedPrivacyAt?: true
    dataRetentionOverride?: true
    createdAt?: true
    updatedAt?: true
    premiumExpiresAt?: true
    premiumSubscriptionId?: true
    stripeCustomerId?: true
    isPremium?: true
    email?: true
    image?: true
    name?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    clerkId?: true
    role?: true
    credits?: true
    resumeJobTitle?: true
    resumeSkills?: true
    resumeExperience?: true
    resumeEducation?: true
    resumeAchievements?: true
    resumeFileUrl?: true
    jobSearchStage?: true
    linkedinUrl?: true
    acceptedTermsAt?: true
    acceptedPrivacyAt?: true
    dataRetentionOverride?: true
    createdAt?: true
    updatedAt?: true
    premiumExpiresAt?: true
    premiumSubscriptionId?: true
    stripeCustomerId?: true
    isPremium?: true
    email?: true
    image?: true
    name?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    clerkId?: true
    role?: true
    credits?: true
    resumeJobTitle?: true
    resumeSkills?: true
    resumeExperience?: true
    resumeEducation?: true
    resumeAchievements?: true
    resumeFileUrl?: true
    jobSearchStage?: true
    linkedinUrl?: true
    acceptedTermsAt?: true
    acceptedPrivacyAt?: true
    dataRetentionOverride?: true
    createdAt?: true
    updatedAt?: true
    premiumExpiresAt?: true
    premiumSubscriptionId?: true
    stripeCustomerId?: true
    isPremium?: true
    email?: true
    image?: true
    name?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    clerkId: string
    role: $Enums.UserRole
    credits: Decimal
    resumeJobTitle: string | null
    resumeSkills: string | null
    resumeExperience: string | null
    resumeEducation: string | null
    resumeAchievements: string | null
    resumeFileUrl: string | null
    jobSearchStage: string | null
    linkedinUrl: string | null
    acceptedTermsAt: Date | null
    acceptedPrivacyAt: Date | null
    dataRetentionOverride: boolean | null
    createdAt: Date
    updatedAt: Date
    premiumExpiresAt: Date | null
    premiumSubscriptionId: string | null
    stripeCustomerId: string | null
    isPremium: boolean
    email: string | null
    image: string | null
    name: string | null
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clerkId?: boolean
    role?: boolean
    credits?: boolean
    resumeJobTitle?: boolean
    resumeSkills?: boolean
    resumeExperience?: boolean
    resumeEducation?: boolean
    resumeAchievements?: boolean
    resumeFileUrl?: boolean
    jobSearchStage?: boolean
    linkedinUrl?: boolean
    acceptedTermsAt?: boolean
    acceptedPrivacyAt?: boolean
    dataRetentionOverride?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    premiumExpiresAt?: boolean
    premiumSubscriptionId?: boolean
    stripeCustomerId?: boolean
    isPremium?: boolean
    email?: boolean
    image?: boolean
    name?: boolean
    feedbacks?: boolean | User$feedbacksArgs<ExtArgs>
    interviewSessions?: boolean | User$interviewSessionsArgs<ExtArgs>
    usageEvents?: boolean | User$usageEventsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clerkId?: boolean
    role?: boolean
    credits?: boolean
    resumeJobTitle?: boolean
    resumeSkills?: boolean
    resumeExperience?: boolean
    resumeEducation?: boolean
    resumeAchievements?: boolean
    resumeFileUrl?: boolean
    jobSearchStage?: boolean
    linkedinUrl?: boolean
    acceptedTermsAt?: boolean
    acceptedPrivacyAt?: boolean
    dataRetentionOverride?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    premiumExpiresAt?: boolean
    premiumSubscriptionId?: boolean
    stripeCustomerId?: boolean
    isPremium?: boolean
    email?: boolean
    image?: boolean
    name?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clerkId?: boolean
    role?: boolean
    credits?: boolean
    resumeJobTitle?: boolean
    resumeSkills?: boolean
    resumeExperience?: boolean
    resumeEducation?: boolean
    resumeAchievements?: boolean
    resumeFileUrl?: boolean
    jobSearchStage?: boolean
    linkedinUrl?: boolean
    acceptedTermsAt?: boolean
    acceptedPrivacyAt?: boolean
    dataRetentionOverride?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    premiumExpiresAt?: boolean
    premiumSubscriptionId?: boolean
    stripeCustomerId?: boolean
    isPremium?: boolean
    email?: boolean
    image?: boolean
    name?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    clerkId?: boolean
    role?: boolean
    credits?: boolean
    resumeJobTitle?: boolean
    resumeSkills?: boolean
    resumeExperience?: boolean
    resumeEducation?: boolean
    resumeAchievements?: boolean
    resumeFileUrl?: boolean
    jobSearchStage?: boolean
    linkedinUrl?: boolean
    acceptedTermsAt?: boolean
    acceptedPrivacyAt?: boolean
    dataRetentionOverride?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    premiumExpiresAt?: boolean
    premiumSubscriptionId?: boolean
    stripeCustomerId?: boolean
    isPremium?: boolean
    email?: boolean
    image?: boolean
    name?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "clerkId" | "role" | "credits" | "resumeJobTitle" | "resumeSkills" | "resumeExperience" | "resumeEducation" | "resumeAchievements" | "resumeFileUrl" | "jobSearchStage" | "linkedinUrl" | "acceptedTermsAt" | "acceptedPrivacyAt" | "dataRetentionOverride" | "createdAt" | "updatedAt" | "premiumExpiresAt" | "premiumSubscriptionId" | "stripeCustomerId" | "isPremium" | "email" | "image" | "name", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    feedbacks?: boolean | User$feedbacksArgs<ExtArgs>
    interviewSessions?: boolean | User$interviewSessionsArgs<ExtArgs>
    usageEvents?: boolean | User$usageEventsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      feedbacks: Prisma.$FeedbackPayload<ExtArgs>[]
      interviewSessions: Prisma.$InterviewSessionPayload<ExtArgs>[]
      usageEvents: Prisma.$UsageEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      clerkId: string
      role: $Enums.UserRole
      credits: Prisma.Decimal
      resumeJobTitle: string | null
      resumeSkills: string | null
      resumeExperience: string | null
      resumeEducation: string | null
      resumeAchievements: string | null
      resumeFileUrl: string | null
      jobSearchStage: string | null
      linkedinUrl: string | null
      acceptedTermsAt: Date | null
      acceptedPrivacyAt: Date | null
      dataRetentionOverride: boolean | null
      createdAt: Date
      updatedAt: Date
      premiumExpiresAt: Date | null
      premiumSubscriptionId: string | null
      stripeCustomerId: string | null
      isPremium: boolean
      email: string | null
      image: string | null
      name: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    feedbacks<T extends User$feedbacksArgs<ExtArgs> = {}>(args?: Subset<T, User$feedbacksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    interviewSessions<T extends User$interviewSessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$interviewSessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    usageEvents<T extends User$usageEventsArgs<ExtArgs> = {}>(args?: Subset<T, User$usageEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsageEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly clerkId: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly credits: FieldRef<"User", 'Decimal'>
    readonly resumeJobTitle: FieldRef<"User", 'String'>
    readonly resumeSkills: FieldRef<"User", 'String'>
    readonly resumeExperience: FieldRef<"User", 'String'>
    readonly resumeEducation: FieldRef<"User", 'String'>
    readonly resumeAchievements: FieldRef<"User", 'String'>
    readonly resumeFileUrl: FieldRef<"User", 'String'>
    readonly jobSearchStage: FieldRef<"User", 'String'>
    readonly linkedinUrl: FieldRef<"User", 'String'>
    readonly acceptedTermsAt: FieldRef<"User", 'DateTime'>
    readonly acceptedPrivacyAt: FieldRef<"User", 'DateTime'>
    readonly dataRetentionOverride: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly premiumExpiresAt: FieldRef<"User", 'DateTime'>
    readonly premiumSubscriptionId: FieldRef<"User", 'String'>
    readonly stripeCustomerId: FieldRef<"User", 'String'>
    readonly isPremium: FieldRef<"User", 'Boolean'>
    readonly email: FieldRef<"User", 'String'>
    readonly image: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.feedbacks
   */
  export type User$feedbacksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackInclude<ExtArgs> | null
    where?: FeedbackWhereInput
    orderBy?: FeedbackOrderByWithRelationInput | FeedbackOrderByWithRelationInput[]
    cursor?: FeedbackWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FeedbackScalarFieldEnum | FeedbackScalarFieldEnum[]
  }

  /**
   * User.interviewSessions
   */
  export type User$interviewSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    where?: InterviewSessionWhereInput
    orderBy?: InterviewSessionOrderByWithRelationInput | InterviewSessionOrderByWithRelationInput[]
    cursor?: InterviewSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InterviewSessionScalarFieldEnum | InterviewSessionScalarFieldEnum[]
  }

  /**
   * User.usageEvents
   */
  export type User$usageEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventInclude<ExtArgs> | null
    where?: UsageEventWhereInput
    orderBy?: UsageEventOrderByWithRelationInput | UsageEventOrderByWithRelationInput[]
    cursor?: UsageEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UsageEventScalarFieldEnum | UsageEventScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model InterviewSession
   */

  export type AggregateInterviewSession = {
    _count: InterviewSessionCountAggregateOutputType | null
    _avg: InterviewSessionAvgAggregateOutputType | null
    _sum: InterviewSessionSumAggregateOutputType | null
    _min: InterviewSessionMinAggregateOutputType | null
    _max: InterviewSessionMaxAggregateOutputType | null
  }

  export type InterviewSessionAvgAggregateOutputType = {
    duration: number | null
    durationSeconds: number | null
  }

  export type InterviewSessionSumAggregateOutputType = {
    duration: number | null
    durationSeconds: number | null
  }

  export type InterviewSessionMinAggregateOutputType = {
    id: string | null
    userId: string | null
    jobTitle: string | null
    company: string | null
    interviewType: string | null
    jdContext: string | null
    openaiSessionId: string | null
    fallbackMode: boolean | null
    startTime: Date | null
    endTime: Date | null
    duration: number | null
    status: string | null
    feedbackStatus: string | null
    startedAt: Date | null
    endedAt: Date | null
    durationSeconds: number | null
    audioUrl: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type InterviewSessionMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    jobTitle: string | null
    company: string | null
    interviewType: string | null
    jdContext: string | null
    openaiSessionId: string | null
    fallbackMode: boolean | null
    startTime: Date | null
    endTime: Date | null
    duration: number | null
    status: string | null
    feedbackStatus: string | null
    startedAt: Date | null
    endedAt: Date | null
    durationSeconds: number | null
    audioUrl: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type InterviewSessionCountAggregateOutputType = {
    id: number
    userId: number
    jobTitle: number
    resumeData: number
    resumeSnapshot: number
    company: number
    interviewType: number
    jdContext: number
    openaiSessionId: number
    fallbackMode: number
    startTime: number
    endTime: number
    duration: number
    status: number
    feedbackStatus: number
    metadata: number
    startedAt: number
    endedAt: number
    durationSeconds: number
    audioUrl: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type InterviewSessionAvgAggregateInputType = {
    duration?: true
    durationSeconds?: true
  }

  export type InterviewSessionSumAggregateInputType = {
    duration?: true
    durationSeconds?: true
  }

  export type InterviewSessionMinAggregateInputType = {
    id?: true
    userId?: true
    jobTitle?: true
    company?: true
    interviewType?: true
    jdContext?: true
    openaiSessionId?: true
    fallbackMode?: true
    startTime?: true
    endTime?: true
    duration?: true
    status?: true
    feedbackStatus?: true
    startedAt?: true
    endedAt?: true
    durationSeconds?: true
    audioUrl?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type InterviewSessionMaxAggregateInputType = {
    id?: true
    userId?: true
    jobTitle?: true
    company?: true
    interviewType?: true
    jdContext?: true
    openaiSessionId?: true
    fallbackMode?: true
    startTime?: true
    endTime?: true
    duration?: true
    status?: true
    feedbackStatus?: true
    startedAt?: true
    endedAt?: true
    durationSeconds?: true
    audioUrl?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type InterviewSessionCountAggregateInputType = {
    id?: true
    userId?: true
    jobTitle?: true
    resumeData?: true
    resumeSnapshot?: true
    company?: true
    interviewType?: true
    jdContext?: true
    openaiSessionId?: true
    fallbackMode?: true
    startTime?: true
    endTime?: true
    duration?: true
    status?: true
    feedbackStatus?: true
    metadata?: true
    startedAt?: true
    endedAt?: true
    durationSeconds?: true
    audioUrl?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type InterviewSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewSession to aggregate.
     */
    where?: InterviewSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewSessions to fetch.
     */
    orderBy?: InterviewSessionOrderByWithRelationInput | InterviewSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InterviewSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InterviewSessions
    **/
    _count?: true | InterviewSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InterviewSessionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InterviewSessionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InterviewSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InterviewSessionMaxAggregateInputType
  }

  export type GetInterviewSessionAggregateType<T extends InterviewSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateInterviewSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInterviewSession[P]>
      : GetScalarType<T[P], AggregateInterviewSession[P]>
  }




  export type InterviewSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InterviewSessionWhereInput
    orderBy?: InterviewSessionOrderByWithAggregationInput | InterviewSessionOrderByWithAggregationInput[]
    by: InterviewSessionScalarFieldEnum[] | InterviewSessionScalarFieldEnum
    having?: InterviewSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InterviewSessionCountAggregateInputType | true
    _avg?: InterviewSessionAvgAggregateInputType
    _sum?: InterviewSessionSumAggregateInputType
    _min?: InterviewSessionMinAggregateInputType
    _max?: InterviewSessionMaxAggregateInputType
  }

  export type InterviewSessionGroupByOutputType = {
    id: string
    userId: string
    jobTitle: string
    resumeData: JsonValue | null
    resumeSnapshot: JsonValue | null
    company: string | null
    interviewType: string | null
    jdContext: string | null
    openaiSessionId: string | null
    fallbackMode: boolean
    startTime: Date | null
    endTime: Date | null
    duration: number | null
    status: string
    feedbackStatus: string
    metadata: JsonValue | null
    startedAt: Date
    endedAt: Date | null
    durationSeconds: number | null
    audioUrl: string | null
    expiresAt: Date | null
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: InterviewSessionCountAggregateOutputType | null
    _avg: InterviewSessionAvgAggregateOutputType | null
    _sum: InterviewSessionSumAggregateOutputType | null
    _min: InterviewSessionMinAggregateOutputType | null
    _max: InterviewSessionMaxAggregateOutputType | null
  }

  type GetInterviewSessionGroupByPayload<T extends InterviewSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InterviewSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InterviewSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InterviewSessionGroupByOutputType[P]>
            : GetScalarType<T[P], InterviewSessionGroupByOutputType[P]>
        }
      >
    >


  export type InterviewSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    jobTitle?: boolean
    resumeData?: boolean
    resumeSnapshot?: boolean
    company?: boolean
    interviewType?: boolean
    jdContext?: boolean
    openaiSessionId?: boolean
    fallbackMode?: boolean
    startTime?: boolean
    endTime?: boolean
    duration?: boolean
    status?: boolean
    feedbackStatus?: boolean
    metadata?: boolean
    startedAt?: boolean
    endedAt?: boolean
    durationSeconds?: boolean
    audioUrl?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    feedbacks?: boolean | InterviewSession$feedbacksArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    transcripts?: boolean | InterviewSession$transcriptsArgs<ExtArgs>
    _count?: boolean | InterviewSessionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewSession"]>

  export type InterviewSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    jobTitle?: boolean
    resumeData?: boolean
    resumeSnapshot?: boolean
    company?: boolean
    interviewType?: boolean
    jdContext?: boolean
    openaiSessionId?: boolean
    fallbackMode?: boolean
    startTime?: boolean
    endTime?: boolean
    duration?: boolean
    status?: boolean
    feedbackStatus?: boolean
    metadata?: boolean
    startedAt?: boolean
    endedAt?: boolean
    durationSeconds?: boolean
    audioUrl?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewSession"]>

  export type InterviewSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    jobTitle?: boolean
    resumeData?: boolean
    resumeSnapshot?: boolean
    company?: boolean
    interviewType?: boolean
    jdContext?: boolean
    openaiSessionId?: boolean
    fallbackMode?: boolean
    startTime?: boolean
    endTime?: boolean
    duration?: boolean
    status?: boolean
    feedbackStatus?: boolean
    metadata?: boolean
    startedAt?: boolean
    endedAt?: boolean
    durationSeconds?: boolean
    audioUrl?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewSession"]>

  export type InterviewSessionSelectScalar = {
    id?: boolean
    userId?: boolean
    jobTitle?: boolean
    resumeData?: boolean
    resumeSnapshot?: boolean
    company?: boolean
    interviewType?: boolean
    jdContext?: boolean
    openaiSessionId?: boolean
    fallbackMode?: boolean
    startTime?: boolean
    endTime?: boolean
    duration?: boolean
    status?: boolean
    feedbackStatus?: boolean
    metadata?: boolean
    startedAt?: boolean
    endedAt?: boolean
    durationSeconds?: boolean
    audioUrl?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type InterviewSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "jobTitle" | "resumeData" | "resumeSnapshot" | "company" | "interviewType" | "jdContext" | "openaiSessionId" | "fallbackMode" | "startTime" | "endTime" | "duration" | "status" | "feedbackStatus" | "metadata" | "startedAt" | "endedAt" | "durationSeconds" | "audioUrl" | "expiresAt" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["interviewSession"]>
  export type InterviewSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    feedbacks?: boolean | InterviewSession$feedbacksArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    transcripts?: boolean | InterviewSession$transcriptsArgs<ExtArgs>
    _count?: boolean | InterviewSessionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InterviewSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type InterviewSessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $InterviewSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InterviewSession"
    objects: {
      feedbacks: Prisma.$FeedbackPayload<ExtArgs>[]
      user: Prisma.$UserPayload<ExtArgs>
      transcripts: Prisma.$TranscriptPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      jobTitle: string
      resumeData: Prisma.JsonValue | null
      resumeSnapshot: Prisma.JsonValue | null
      company: string | null
      interviewType: string | null
      jdContext: string | null
      openaiSessionId: string | null
      fallbackMode: boolean
      startTime: Date | null
      endTime: Date | null
      duration: number | null
      status: string
      feedbackStatus: string
      metadata: Prisma.JsonValue | null
      startedAt: Date
      endedAt: Date | null
      durationSeconds: number | null
      audioUrl: string | null
      expiresAt: Date | null
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["interviewSession"]>
    composites: {}
  }

  type InterviewSessionGetPayload<S extends boolean | null | undefined | InterviewSessionDefaultArgs> = $Result.GetResult<Prisma.$InterviewSessionPayload, S>

  type InterviewSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InterviewSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InterviewSessionCountAggregateInputType | true
    }

  export interface InterviewSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InterviewSession'], meta: { name: 'InterviewSession' } }
    /**
     * Find zero or one InterviewSession that matches the filter.
     * @param {InterviewSessionFindUniqueArgs} args - Arguments to find a InterviewSession
     * @example
     * // Get one InterviewSession
     * const interviewSession = await prisma.interviewSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InterviewSessionFindUniqueArgs>(args: SelectSubset<T, InterviewSessionFindUniqueArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one InterviewSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InterviewSessionFindUniqueOrThrowArgs} args - Arguments to find a InterviewSession
     * @example
     * // Get one InterviewSession
     * const interviewSession = await prisma.interviewSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InterviewSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, InterviewSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InterviewSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionFindFirstArgs} args - Arguments to find a InterviewSession
     * @example
     * // Get one InterviewSession
     * const interviewSession = await prisma.interviewSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InterviewSessionFindFirstArgs>(args?: SelectSubset<T, InterviewSessionFindFirstArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InterviewSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionFindFirstOrThrowArgs} args - Arguments to find a InterviewSession
     * @example
     * // Get one InterviewSession
     * const interviewSession = await prisma.interviewSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InterviewSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, InterviewSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more InterviewSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InterviewSessions
     * const interviewSessions = await prisma.interviewSession.findMany()
     * 
     * // Get first 10 InterviewSessions
     * const interviewSessions = await prisma.interviewSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const interviewSessionWithIdOnly = await prisma.interviewSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InterviewSessionFindManyArgs>(args?: SelectSubset<T, InterviewSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a InterviewSession.
     * @param {InterviewSessionCreateArgs} args - Arguments to create a InterviewSession.
     * @example
     * // Create one InterviewSession
     * const InterviewSession = await prisma.interviewSession.create({
     *   data: {
     *     // ... data to create a InterviewSession
     *   }
     * })
     * 
     */
    create<T extends InterviewSessionCreateArgs>(args: SelectSubset<T, InterviewSessionCreateArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many InterviewSessions.
     * @param {InterviewSessionCreateManyArgs} args - Arguments to create many InterviewSessions.
     * @example
     * // Create many InterviewSessions
     * const interviewSession = await prisma.interviewSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InterviewSessionCreateManyArgs>(args?: SelectSubset<T, InterviewSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InterviewSessions and returns the data saved in the database.
     * @param {InterviewSessionCreateManyAndReturnArgs} args - Arguments to create many InterviewSessions.
     * @example
     * // Create many InterviewSessions
     * const interviewSession = await prisma.interviewSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InterviewSessions and only return the `id`
     * const interviewSessionWithIdOnly = await prisma.interviewSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InterviewSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, InterviewSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a InterviewSession.
     * @param {InterviewSessionDeleteArgs} args - Arguments to delete one InterviewSession.
     * @example
     * // Delete one InterviewSession
     * const InterviewSession = await prisma.interviewSession.delete({
     *   where: {
     *     // ... filter to delete one InterviewSession
     *   }
     * })
     * 
     */
    delete<T extends InterviewSessionDeleteArgs>(args: SelectSubset<T, InterviewSessionDeleteArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one InterviewSession.
     * @param {InterviewSessionUpdateArgs} args - Arguments to update one InterviewSession.
     * @example
     * // Update one InterviewSession
     * const interviewSession = await prisma.interviewSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InterviewSessionUpdateArgs>(args: SelectSubset<T, InterviewSessionUpdateArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more InterviewSessions.
     * @param {InterviewSessionDeleteManyArgs} args - Arguments to filter InterviewSessions to delete.
     * @example
     * // Delete a few InterviewSessions
     * const { count } = await prisma.interviewSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InterviewSessionDeleteManyArgs>(args?: SelectSubset<T, InterviewSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InterviewSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InterviewSessions
     * const interviewSession = await prisma.interviewSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InterviewSessionUpdateManyArgs>(args: SelectSubset<T, InterviewSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InterviewSessions and returns the data updated in the database.
     * @param {InterviewSessionUpdateManyAndReturnArgs} args - Arguments to update many InterviewSessions.
     * @example
     * // Update many InterviewSessions
     * const interviewSession = await prisma.interviewSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more InterviewSessions and only return the `id`
     * const interviewSessionWithIdOnly = await prisma.interviewSession.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InterviewSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, InterviewSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one InterviewSession.
     * @param {InterviewSessionUpsertArgs} args - Arguments to update or create a InterviewSession.
     * @example
     * // Update or create a InterviewSession
     * const interviewSession = await prisma.interviewSession.upsert({
     *   create: {
     *     // ... data to create a InterviewSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InterviewSession we want to update
     *   }
     * })
     */
    upsert<T extends InterviewSessionUpsertArgs>(args: SelectSubset<T, InterviewSessionUpsertArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of InterviewSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionCountArgs} args - Arguments to filter InterviewSessions to count.
     * @example
     * // Count the number of InterviewSessions
     * const count = await prisma.interviewSession.count({
     *   where: {
     *     // ... the filter for the InterviewSessions we want to count
     *   }
     * })
    **/
    count<T extends InterviewSessionCountArgs>(
      args?: Subset<T, InterviewSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InterviewSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InterviewSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InterviewSessionAggregateArgs>(args: Subset<T, InterviewSessionAggregateArgs>): Prisma.PrismaPromise<GetInterviewSessionAggregateType<T>>

    /**
     * Group by InterviewSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InterviewSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InterviewSessionGroupByArgs['orderBy'] }
        : { orderBy?: InterviewSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InterviewSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInterviewSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InterviewSession model
   */
  readonly fields: InterviewSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InterviewSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InterviewSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    feedbacks<T extends InterviewSession$feedbacksArgs<ExtArgs> = {}>(args?: Subset<T, InterviewSession$feedbacksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    transcripts<T extends InterviewSession$transcriptsArgs<ExtArgs> = {}>(args?: Subset<T, InterviewSession$transcriptsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TranscriptPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InterviewSession model
   */
  interface InterviewSessionFieldRefs {
    readonly id: FieldRef<"InterviewSession", 'String'>
    readonly userId: FieldRef<"InterviewSession", 'String'>
    readonly jobTitle: FieldRef<"InterviewSession", 'String'>
    readonly resumeData: FieldRef<"InterviewSession", 'Json'>
    readonly resumeSnapshot: FieldRef<"InterviewSession", 'Json'>
    readonly company: FieldRef<"InterviewSession", 'String'>
    readonly interviewType: FieldRef<"InterviewSession", 'String'>
    readonly jdContext: FieldRef<"InterviewSession", 'String'>
    readonly openaiSessionId: FieldRef<"InterviewSession", 'String'>
    readonly fallbackMode: FieldRef<"InterviewSession", 'Boolean'>
    readonly startTime: FieldRef<"InterviewSession", 'DateTime'>
    readonly endTime: FieldRef<"InterviewSession", 'DateTime'>
    readonly duration: FieldRef<"InterviewSession", 'Int'>
    readonly status: FieldRef<"InterviewSession", 'String'>
    readonly feedbackStatus: FieldRef<"InterviewSession", 'String'>
    readonly metadata: FieldRef<"InterviewSession", 'Json'>
    readonly startedAt: FieldRef<"InterviewSession", 'DateTime'>
    readonly endedAt: FieldRef<"InterviewSession", 'DateTime'>
    readonly durationSeconds: FieldRef<"InterviewSession", 'Int'>
    readonly audioUrl: FieldRef<"InterviewSession", 'String'>
    readonly expiresAt: FieldRef<"InterviewSession", 'DateTime'>
    readonly createdAt: FieldRef<"InterviewSession", 'DateTime'>
    readonly updatedAt: FieldRef<"InterviewSession", 'DateTime'>
    readonly deletedAt: FieldRef<"InterviewSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InterviewSession findUnique
   */
  export type InterviewSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * Filter, which InterviewSession to fetch.
     */
    where: InterviewSessionWhereUniqueInput
  }

  /**
   * InterviewSession findUniqueOrThrow
   */
  export type InterviewSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * Filter, which InterviewSession to fetch.
     */
    where: InterviewSessionWhereUniqueInput
  }

  /**
   * InterviewSession findFirst
   */
  export type InterviewSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * Filter, which InterviewSession to fetch.
     */
    where?: InterviewSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewSessions to fetch.
     */
    orderBy?: InterviewSessionOrderByWithRelationInput | InterviewSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewSessions.
     */
    cursor?: InterviewSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewSessions.
     */
    distinct?: InterviewSessionScalarFieldEnum | InterviewSessionScalarFieldEnum[]
  }

  /**
   * InterviewSession findFirstOrThrow
   */
  export type InterviewSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * Filter, which InterviewSession to fetch.
     */
    where?: InterviewSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewSessions to fetch.
     */
    orderBy?: InterviewSessionOrderByWithRelationInput | InterviewSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewSessions.
     */
    cursor?: InterviewSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewSessions.
     */
    distinct?: InterviewSessionScalarFieldEnum | InterviewSessionScalarFieldEnum[]
  }

  /**
   * InterviewSession findMany
   */
  export type InterviewSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * Filter, which InterviewSessions to fetch.
     */
    where?: InterviewSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewSessions to fetch.
     */
    orderBy?: InterviewSessionOrderByWithRelationInput | InterviewSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InterviewSessions.
     */
    cursor?: InterviewSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewSessions.
     */
    skip?: number
    distinct?: InterviewSessionScalarFieldEnum | InterviewSessionScalarFieldEnum[]
  }

  /**
   * InterviewSession create
   */
  export type InterviewSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a InterviewSession.
     */
    data: XOR<InterviewSessionCreateInput, InterviewSessionUncheckedCreateInput>
  }

  /**
   * InterviewSession createMany
   */
  export type InterviewSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InterviewSessions.
     */
    data: InterviewSessionCreateManyInput | InterviewSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InterviewSession createManyAndReturn
   */
  export type InterviewSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * The data used to create many InterviewSessions.
     */
    data: InterviewSessionCreateManyInput | InterviewSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * InterviewSession update
   */
  export type InterviewSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a InterviewSession.
     */
    data: XOR<InterviewSessionUpdateInput, InterviewSessionUncheckedUpdateInput>
    /**
     * Choose, which InterviewSession to update.
     */
    where: InterviewSessionWhereUniqueInput
  }

  /**
   * InterviewSession updateMany
   */
  export type InterviewSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InterviewSessions.
     */
    data: XOR<InterviewSessionUpdateManyMutationInput, InterviewSessionUncheckedUpdateManyInput>
    /**
     * Filter which InterviewSessions to update
     */
    where?: InterviewSessionWhereInput
    /**
     * Limit how many InterviewSessions to update.
     */
    limit?: number
  }

  /**
   * InterviewSession updateManyAndReturn
   */
  export type InterviewSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * The data used to update InterviewSessions.
     */
    data: XOR<InterviewSessionUpdateManyMutationInput, InterviewSessionUncheckedUpdateManyInput>
    /**
     * Filter which InterviewSessions to update
     */
    where?: InterviewSessionWhereInput
    /**
     * Limit how many InterviewSessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * InterviewSession upsert
   */
  export type InterviewSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the InterviewSession to update in case it exists.
     */
    where: InterviewSessionWhereUniqueInput
    /**
     * In case the InterviewSession found by the `where` argument doesn't exist, create a new InterviewSession with this data.
     */
    create: XOR<InterviewSessionCreateInput, InterviewSessionUncheckedCreateInput>
    /**
     * In case the InterviewSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InterviewSessionUpdateInput, InterviewSessionUncheckedUpdateInput>
  }

  /**
   * InterviewSession delete
   */
  export type InterviewSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * Filter which InterviewSession to delete.
     */
    where: InterviewSessionWhereUniqueInput
  }

  /**
   * InterviewSession deleteMany
   */
  export type InterviewSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewSessions to delete
     */
    where?: InterviewSessionWhereInput
    /**
     * Limit how many InterviewSessions to delete.
     */
    limit?: number
  }

  /**
   * InterviewSession.feedbacks
   */
  export type InterviewSession$feedbacksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackInclude<ExtArgs> | null
    where?: FeedbackWhereInput
    orderBy?: FeedbackOrderByWithRelationInput | FeedbackOrderByWithRelationInput[]
    cursor?: FeedbackWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FeedbackScalarFieldEnum | FeedbackScalarFieldEnum[]
  }

  /**
   * InterviewSession.transcripts
   */
  export type InterviewSession$transcriptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptInclude<ExtArgs> | null
    where?: TranscriptWhereInput
    orderBy?: TranscriptOrderByWithRelationInput | TranscriptOrderByWithRelationInput[]
    cursor?: TranscriptWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TranscriptScalarFieldEnum | TranscriptScalarFieldEnum[]
  }

  /**
   * InterviewSession without action
   */
  export type InterviewSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewSession
     */
    omit?: InterviewSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
  }


  /**
   * Model Transcript
   */

  export type AggregateTranscript = {
    _count: TranscriptCountAggregateOutputType | null
    _avg: TranscriptAvgAggregateOutputType | null
    _sum: TranscriptSumAggregateOutputType | null
    _min: TranscriptMinAggregateOutputType | null
    _max: TranscriptMaxAggregateOutputType | null
  }

  export type TranscriptAvgAggregateOutputType = {
    confidence: number | null
    sequenceNumber: number | null
  }

  export type TranscriptSumAggregateOutputType = {
    confidence: number | null
    sequenceNumber: number | null
  }

  export type TranscriptMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    role: string | null
    content: string | null
    confidence: number | null
    timestamp: Date | null
    sequenceNumber: number | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TranscriptMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    role: string | null
    content: string | null
    confidence: number | null
    timestamp: Date | null
    sequenceNumber: number | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TranscriptCountAggregateOutputType = {
    id: number
    sessionId: number
    role: number
    content: number
    confidence: number
    timestamp: number
    sequenceNumber: number
    metadata: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TranscriptAvgAggregateInputType = {
    confidence?: true
    sequenceNumber?: true
  }

  export type TranscriptSumAggregateInputType = {
    confidence?: true
    sequenceNumber?: true
  }

  export type TranscriptMinAggregateInputType = {
    id?: true
    sessionId?: true
    role?: true
    content?: true
    confidence?: true
    timestamp?: true
    sequenceNumber?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TranscriptMaxAggregateInputType = {
    id?: true
    sessionId?: true
    role?: true
    content?: true
    confidence?: true
    timestamp?: true
    sequenceNumber?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TranscriptCountAggregateInputType = {
    id?: true
    sessionId?: true
    role?: true
    content?: true
    confidence?: true
    timestamp?: true
    sequenceNumber?: true
    metadata?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TranscriptAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transcript to aggregate.
     */
    where?: TranscriptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transcripts to fetch.
     */
    orderBy?: TranscriptOrderByWithRelationInput | TranscriptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TranscriptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transcripts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transcripts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Transcripts
    **/
    _count?: true | TranscriptCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TranscriptAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TranscriptSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TranscriptMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TranscriptMaxAggregateInputType
  }

  export type GetTranscriptAggregateType<T extends TranscriptAggregateArgs> = {
        [P in keyof T & keyof AggregateTranscript]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTranscript[P]>
      : GetScalarType<T[P], AggregateTranscript[P]>
  }




  export type TranscriptGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TranscriptWhereInput
    orderBy?: TranscriptOrderByWithAggregationInput | TranscriptOrderByWithAggregationInput[]
    by: TranscriptScalarFieldEnum[] | TranscriptScalarFieldEnum
    having?: TranscriptScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TranscriptCountAggregateInputType | true
    _avg?: TranscriptAvgAggregateInputType
    _sum?: TranscriptSumAggregateInputType
    _min?: TranscriptMinAggregateInputType
    _max?: TranscriptMaxAggregateInputType
  }

  export type TranscriptGroupByOutputType = {
    id: string
    sessionId: string
    role: string
    content: string
    confidence: number | null
    timestamp: Date
    sequenceNumber: number
    metadata: JsonValue | null
    expiresAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: TranscriptCountAggregateOutputType | null
    _avg: TranscriptAvgAggregateOutputType | null
    _sum: TranscriptSumAggregateOutputType | null
    _min: TranscriptMinAggregateOutputType | null
    _max: TranscriptMaxAggregateOutputType | null
  }

  type GetTranscriptGroupByPayload<T extends TranscriptGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TranscriptGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TranscriptGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TranscriptGroupByOutputType[P]>
            : GetScalarType<T[P], TranscriptGroupByOutputType[P]>
        }
      >
    >


  export type TranscriptSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    role?: boolean
    content?: boolean
    confidence?: boolean
    timestamp?: boolean
    sequenceNumber?: boolean
    metadata?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | InterviewSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transcript"]>

  export type TranscriptSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    role?: boolean
    content?: boolean
    confidence?: boolean
    timestamp?: boolean
    sequenceNumber?: boolean
    metadata?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | InterviewSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transcript"]>

  export type TranscriptSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    role?: boolean
    content?: boolean
    confidence?: boolean
    timestamp?: boolean
    sequenceNumber?: boolean
    metadata?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | InterviewSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transcript"]>

  export type TranscriptSelectScalar = {
    id?: boolean
    sessionId?: boolean
    role?: boolean
    content?: boolean
    confidence?: boolean
    timestamp?: boolean
    sequenceNumber?: boolean
    metadata?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TranscriptOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionId" | "role" | "content" | "confidence" | "timestamp" | "sequenceNumber" | "metadata" | "expiresAt" | "createdAt" | "updatedAt", ExtArgs["result"]["transcript"]>
  export type TranscriptInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | InterviewSessionDefaultArgs<ExtArgs>
  }
  export type TranscriptIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | InterviewSessionDefaultArgs<ExtArgs>
  }
  export type TranscriptIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | InterviewSessionDefaultArgs<ExtArgs>
  }

  export type $TranscriptPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Transcript"
    objects: {
      session: Prisma.$InterviewSessionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      role: string
      content: string
      confidence: number | null
      timestamp: Date
      sequenceNumber: number
      metadata: Prisma.JsonValue | null
      expiresAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["transcript"]>
    composites: {}
  }

  type TranscriptGetPayload<S extends boolean | null | undefined | TranscriptDefaultArgs> = $Result.GetResult<Prisma.$TranscriptPayload, S>

  type TranscriptCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TranscriptFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TranscriptCountAggregateInputType | true
    }

  export interface TranscriptDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Transcript'], meta: { name: 'Transcript' } }
    /**
     * Find zero or one Transcript that matches the filter.
     * @param {TranscriptFindUniqueArgs} args - Arguments to find a Transcript
     * @example
     * // Get one Transcript
     * const transcript = await prisma.transcript.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TranscriptFindUniqueArgs>(args: SelectSubset<T, TranscriptFindUniqueArgs<ExtArgs>>): Prisma__TranscriptClient<$Result.GetResult<Prisma.$TranscriptPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Transcript that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TranscriptFindUniqueOrThrowArgs} args - Arguments to find a Transcript
     * @example
     * // Get one Transcript
     * const transcript = await prisma.transcript.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TranscriptFindUniqueOrThrowArgs>(args: SelectSubset<T, TranscriptFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TranscriptClient<$Result.GetResult<Prisma.$TranscriptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transcript that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TranscriptFindFirstArgs} args - Arguments to find a Transcript
     * @example
     * // Get one Transcript
     * const transcript = await prisma.transcript.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TranscriptFindFirstArgs>(args?: SelectSubset<T, TranscriptFindFirstArgs<ExtArgs>>): Prisma__TranscriptClient<$Result.GetResult<Prisma.$TranscriptPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transcript that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TranscriptFindFirstOrThrowArgs} args - Arguments to find a Transcript
     * @example
     * // Get one Transcript
     * const transcript = await prisma.transcript.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TranscriptFindFirstOrThrowArgs>(args?: SelectSubset<T, TranscriptFindFirstOrThrowArgs<ExtArgs>>): Prisma__TranscriptClient<$Result.GetResult<Prisma.$TranscriptPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Transcripts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TranscriptFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transcripts
     * const transcripts = await prisma.transcript.findMany()
     * 
     * // Get first 10 Transcripts
     * const transcripts = await prisma.transcript.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transcriptWithIdOnly = await prisma.transcript.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TranscriptFindManyArgs>(args?: SelectSubset<T, TranscriptFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TranscriptPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Transcript.
     * @param {TranscriptCreateArgs} args - Arguments to create a Transcript.
     * @example
     * // Create one Transcript
     * const Transcript = await prisma.transcript.create({
     *   data: {
     *     // ... data to create a Transcript
     *   }
     * })
     * 
     */
    create<T extends TranscriptCreateArgs>(args: SelectSubset<T, TranscriptCreateArgs<ExtArgs>>): Prisma__TranscriptClient<$Result.GetResult<Prisma.$TranscriptPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Transcripts.
     * @param {TranscriptCreateManyArgs} args - Arguments to create many Transcripts.
     * @example
     * // Create many Transcripts
     * const transcript = await prisma.transcript.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TranscriptCreateManyArgs>(args?: SelectSubset<T, TranscriptCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Transcripts and returns the data saved in the database.
     * @param {TranscriptCreateManyAndReturnArgs} args - Arguments to create many Transcripts.
     * @example
     * // Create many Transcripts
     * const transcript = await prisma.transcript.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Transcripts and only return the `id`
     * const transcriptWithIdOnly = await prisma.transcript.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TranscriptCreateManyAndReturnArgs>(args?: SelectSubset<T, TranscriptCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TranscriptPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Transcript.
     * @param {TranscriptDeleteArgs} args - Arguments to delete one Transcript.
     * @example
     * // Delete one Transcript
     * const Transcript = await prisma.transcript.delete({
     *   where: {
     *     // ... filter to delete one Transcript
     *   }
     * })
     * 
     */
    delete<T extends TranscriptDeleteArgs>(args: SelectSubset<T, TranscriptDeleteArgs<ExtArgs>>): Prisma__TranscriptClient<$Result.GetResult<Prisma.$TranscriptPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Transcript.
     * @param {TranscriptUpdateArgs} args - Arguments to update one Transcript.
     * @example
     * // Update one Transcript
     * const transcript = await prisma.transcript.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TranscriptUpdateArgs>(args: SelectSubset<T, TranscriptUpdateArgs<ExtArgs>>): Prisma__TranscriptClient<$Result.GetResult<Prisma.$TranscriptPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Transcripts.
     * @param {TranscriptDeleteManyArgs} args - Arguments to filter Transcripts to delete.
     * @example
     * // Delete a few Transcripts
     * const { count } = await prisma.transcript.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TranscriptDeleteManyArgs>(args?: SelectSubset<T, TranscriptDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transcripts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TranscriptUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transcripts
     * const transcript = await prisma.transcript.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TranscriptUpdateManyArgs>(args: SelectSubset<T, TranscriptUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transcripts and returns the data updated in the database.
     * @param {TranscriptUpdateManyAndReturnArgs} args - Arguments to update many Transcripts.
     * @example
     * // Update many Transcripts
     * const transcript = await prisma.transcript.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Transcripts and only return the `id`
     * const transcriptWithIdOnly = await prisma.transcript.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TranscriptUpdateManyAndReturnArgs>(args: SelectSubset<T, TranscriptUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TranscriptPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Transcript.
     * @param {TranscriptUpsertArgs} args - Arguments to update or create a Transcript.
     * @example
     * // Update or create a Transcript
     * const transcript = await prisma.transcript.upsert({
     *   create: {
     *     // ... data to create a Transcript
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transcript we want to update
     *   }
     * })
     */
    upsert<T extends TranscriptUpsertArgs>(args: SelectSubset<T, TranscriptUpsertArgs<ExtArgs>>): Prisma__TranscriptClient<$Result.GetResult<Prisma.$TranscriptPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Transcripts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TranscriptCountArgs} args - Arguments to filter Transcripts to count.
     * @example
     * // Count the number of Transcripts
     * const count = await prisma.transcript.count({
     *   where: {
     *     // ... the filter for the Transcripts we want to count
     *   }
     * })
    **/
    count<T extends TranscriptCountArgs>(
      args?: Subset<T, TranscriptCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TranscriptCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Transcript.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TranscriptAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TranscriptAggregateArgs>(args: Subset<T, TranscriptAggregateArgs>): Prisma.PrismaPromise<GetTranscriptAggregateType<T>>

    /**
     * Group by Transcript.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TranscriptGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TranscriptGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TranscriptGroupByArgs['orderBy'] }
        : { orderBy?: TranscriptGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TranscriptGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTranscriptGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Transcript model
   */
  readonly fields: TranscriptFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transcript.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TranscriptClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    session<T extends InterviewSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InterviewSessionDefaultArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Transcript model
   */
  interface TranscriptFieldRefs {
    readonly id: FieldRef<"Transcript", 'String'>
    readonly sessionId: FieldRef<"Transcript", 'String'>
    readonly role: FieldRef<"Transcript", 'String'>
    readonly content: FieldRef<"Transcript", 'String'>
    readonly confidence: FieldRef<"Transcript", 'Float'>
    readonly timestamp: FieldRef<"Transcript", 'DateTime'>
    readonly sequenceNumber: FieldRef<"Transcript", 'Int'>
    readonly metadata: FieldRef<"Transcript", 'Json'>
    readonly expiresAt: FieldRef<"Transcript", 'DateTime'>
    readonly createdAt: FieldRef<"Transcript", 'DateTime'>
    readonly updatedAt: FieldRef<"Transcript", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Transcript findUnique
   */
  export type TranscriptFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptInclude<ExtArgs> | null
    /**
     * Filter, which Transcript to fetch.
     */
    where: TranscriptWhereUniqueInput
  }

  /**
   * Transcript findUniqueOrThrow
   */
  export type TranscriptFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptInclude<ExtArgs> | null
    /**
     * Filter, which Transcript to fetch.
     */
    where: TranscriptWhereUniqueInput
  }

  /**
   * Transcript findFirst
   */
  export type TranscriptFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptInclude<ExtArgs> | null
    /**
     * Filter, which Transcript to fetch.
     */
    where?: TranscriptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transcripts to fetch.
     */
    orderBy?: TranscriptOrderByWithRelationInput | TranscriptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transcripts.
     */
    cursor?: TranscriptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transcripts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transcripts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transcripts.
     */
    distinct?: TranscriptScalarFieldEnum | TranscriptScalarFieldEnum[]
  }

  /**
   * Transcript findFirstOrThrow
   */
  export type TranscriptFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptInclude<ExtArgs> | null
    /**
     * Filter, which Transcript to fetch.
     */
    where?: TranscriptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transcripts to fetch.
     */
    orderBy?: TranscriptOrderByWithRelationInput | TranscriptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transcripts.
     */
    cursor?: TranscriptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transcripts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transcripts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transcripts.
     */
    distinct?: TranscriptScalarFieldEnum | TranscriptScalarFieldEnum[]
  }

  /**
   * Transcript findMany
   */
  export type TranscriptFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptInclude<ExtArgs> | null
    /**
     * Filter, which Transcripts to fetch.
     */
    where?: TranscriptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transcripts to fetch.
     */
    orderBy?: TranscriptOrderByWithRelationInput | TranscriptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Transcripts.
     */
    cursor?: TranscriptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transcripts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transcripts.
     */
    skip?: number
    distinct?: TranscriptScalarFieldEnum | TranscriptScalarFieldEnum[]
  }

  /**
   * Transcript create
   */
  export type TranscriptCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptInclude<ExtArgs> | null
    /**
     * The data needed to create a Transcript.
     */
    data: XOR<TranscriptCreateInput, TranscriptUncheckedCreateInput>
  }

  /**
   * Transcript createMany
   */
  export type TranscriptCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Transcripts.
     */
    data: TranscriptCreateManyInput | TranscriptCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Transcript createManyAndReturn
   */
  export type TranscriptCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * The data used to create many Transcripts.
     */
    data: TranscriptCreateManyInput | TranscriptCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transcript update
   */
  export type TranscriptUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptInclude<ExtArgs> | null
    /**
     * The data needed to update a Transcript.
     */
    data: XOR<TranscriptUpdateInput, TranscriptUncheckedUpdateInput>
    /**
     * Choose, which Transcript to update.
     */
    where: TranscriptWhereUniqueInput
  }

  /**
   * Transcript updateMany
   */
  export type TranscriptUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Transcripts.
     */
    data: XOR<TranscriptUpdateManyMutationInput, TranscriptUncheckedUpdateManyInput>
    /**
     * Filter which Transcripts to update
     */
    where?: TranscriptWhereInput
    /**
     * Limit how many Transcripts to update.
     */
    limit?: number
  }

  /**
   * Transcript updateManyAndReturn
   */
  export type TranscriptUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * The data used to update Transcripts.
     */
    data: XOR<TranscriptUpdateManyMutationInput, TranscriptUncheckedUpdateManyInput>
    /**
     * Filter which Transcripts to update
     */
    where?: TranscriptWhereInput
    /**
     * Limit how many Transcripts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transcript upsert
   */
  export type TranscriptUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptInclude<ExtArgs> | null
    /**
     * The filter to search for the Transcript to update in case it exists.
     */
    where: TranscriptWhereUniqueInput
    /**
     * In case the Transcript found by the `where` argument doesn't exist, create a new Transcript with this data.
     */
    create: XOR<TranscriptCreateInput, TranscriptUncheckedCreateInput>
    /**
     * In case the Transcript was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TranscriptUpdateInput, TranscriptUncheckedUpdateInput>
  }

  /**
   * Transcript delete
   */
  export type TranscriptDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptInclude<ExtArgs> | null
    /**
     * Filter which Transcript to delete.
     */
    where: TranscriptWhereUniqueInput
  }

  /**
   * Transcript deleteMany
   */
  export type TranscriptDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transcripts to delete
     */
    where?: TranscriptWhereInput
    /**
     * Limit how many Transcripts to delete.
     */
    limit?: number
  }

  /**
   * Transcript without action
   */
  export type TranscriptDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transcript
     */
    select?: TranscriptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transcript
     */
    omit?: TranscriptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TranscriptInclude<ExtArgs> | null
  }


  /**
   * Model Feedback
   */

  export type AggregateFeedback = {
    _count: FeedbackCountAggregateOutputType | null
    _avg: FeedbackAvgAggregateOutputType | null
    _sum: FeedbackSumAggregateOutputType | null
    _min: FeedbackMinAggregateOutputType | null
    _max: FeedbackMaxAggregateOutputType | null
  }

  export type FeedbackAvgAggregateOutputType = {
    fillerWordCount: number | null
    transcriptScore: number | null
    clarityScore: number | null
    concisenessScore: number | null
    technicalDepthScore: number | null
    starMethodScore: number | null
    overallScore: number | null
    keywordRelevanceScore: number | null
  }

  export type FeedbackSumAggregateOutputType = {
    fillerWordCount: number | null
    transcriptScore: number | null
    clarityScore: number | null
    concisenessScore: number | null
    technicalDepthScore: number | null
    starMethodScore: number | null
    overallScore: number | null
    keywordRelevanceScore: number | null
  }

  export type FeedbackMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    userId: string | null
    summary: string | null
    strengths: string | null
    areasForImprovement: string | null
    fillerWordCount: number | null
    transcriptScore: number | null
    clarityScore: number | null
    concisenessScore: number | null
    technicalDepthScore: number | null
    starMethodScore: number | null
    overallScore: number | null
    enhancedFeedbackGenerated: boolean | null
    keywordRelevanceScore: number | null
    enhancedGeneratedAt: Date | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FeedbackMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    userId: string | null
    summary: string | null
    strengths: string | null
    areasForImprovement: string | null
    fillerWordCount: number | null
    transcriptScore: number | null
    clarityScore: number | null
    concisenessScore: number | null
    technicalDepthScore: number | null
    starMethodScore: number | null
    overallScore: number | null
    enhancedFeedbackGenerated: boolean | null
    keywordRelevanceScore: number | null
    enhancedGeneratedAt: Date | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FeedbackCountAggregateOutputType = {
    id: number
    sessionId: number
    userId: number
    summary: number
    strengths: number
    areasForImprovement: number
    fillerWordCount: number
    transcriptScore: number
    structuredData: number
    clarityScore: number
    concisenessScore: number
    technicalDepthScore: number
    starMethodScore: number
    overallScore: number
    enhancedFeedbackGenerated: number
    enhancedReportData: number
    toneAnalysis: number
    keywordRelevanceScore: number
    sentimentProgression: number
    enhancedGeneratedAt: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FeedbackAvgAggregateInputType = {
    fillerWordCount?: true
    transcriptScore?: true
    clarityScore?: true
    concisenessScore?: true
    technicalDepthScore?: true
    starMethodScore?: true
    overallScore?: true
    keywordRelevanceScore?: true
  }

  export type FeedbackSumAggregateInputType = {
    fillerWordCount?: true
    transcriptScore?: true
    clarityScore?: true
    concisenessScore?: true
    technicalDepthScore?: true
    starMethodScore?: true
    overallScore?: true
    keywordRelevanceScore?: true
  }

  export type FeedbackMinAggregateInputType = {
    id?: true
    sessionId?: true
    userId?: true
    summary?: true
    strengths?: true
    areasForImprovement?: true
    fillerWordCount?: true
    transcriptScore?: true
    clarityScore?: true
    concisenessScore?: true
    technicalDepthScore?: true
    starMethodScore?: true
    overallScore?: true
    enhancedFeedbackGenerated?: true
    keywordRelevanceScore?: true
    enhancedGeneratedAt?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FeedbackMaxAggregateInputType = {
    id?: true
    sessionId?: true
    userId?: true
    summary?: true
    strengths?: true
    areasForImprovement?: true
    fillerWordCount?: true
    transcriptScore?: true
    clarityScore?: true
    concisenessScore?: true
    technicalDepthScore?: true
    starMethodScore?: true
    overallScore?: true
    enhancedFeedbackGenerated?: true
    keywordRelevanceScore?: true
    enhancedGeneratedAt?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FeedbackCountAggregateInputType = {
    id?: true
    sessionId?: true
    userId?: true
    summary?: true
    strengths?: true
    areasForImprovement?: true
    fillerWordCount?: true
    transcriptScore?: true
    structuredData?: true
    clarityScore?: true
    concisenessScore?: true
    technicalDepthScore?: true
    starMethodScore?: true
    overallScore?: true
    enhancedFeedbackGenerated?: true
    enhancedReportData?: true
    toneAnalysis?: true
    keywordRelevanceScore?: true
    sentimentProgression?: true
    enhancedGeneratedAt?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FeedbackAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Feedback to aggregate.
     */
    where?: FeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Feedbacks to fetch.
     */
    orderBy?: FeedbackOrderByWithRelationInput | FeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Feedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Feedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Feedbacks
    **/
    _count?: true | FeedbackCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FeedbackAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FeedbackSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FeedbackMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FeedbackMaxAggregateInputType
  }

  export type GetFeedbackAggregateType<T extends FeedbackAggregateArgs> = {
        [P in keyof T & keyof AggregateFeedback]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFeedback[P]>
      : GetScalarType<T[P], AggregateFeedback[P]>
  }




  export type FeedbackGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FeedbackWhereInput
    orderBy?: FeedbackOrderByWithAggregationInput | FeedbackOrderByWithAggregationInput[]
    by: FeedbackScalarFieldEnum[] | FeedbackScalarFieldEnum
    having?: FeedbackScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FeedbackCountAggregateInputType | true
    _avg?: FeedbackAvgAggregateInputType
    _sum?: FeedbackSumAggregateInputType
    _min?: FeedbackMinAggregateInputType
    _max?: FeedbackMaxAggregateInputType
  }

  export type FeedbackGroupByOutputType = {
    id: string
    sessionId: string
    userId: string
    summary: string
    strengths: string | null
    areasForImprovement: string | null
    fillerWordCount: number | null
    transcriptScore: number | null
    structuredData: JsonValue | null
    clarityScore: number | null
    concisenessScore: number | null
    technicalDepthScore: number | null
    starMethodScore: number | null
    overallScore: number | null
    enhancedFeedbackGenerated: boolean
    enhancedReportData: JsonValue | null
    toneAnalysis: JsonValue | null
    keywordRelevanceScore: number | null
    sentimentProgression: JsonValue | null
    enhancedGeneratedAt: Date | null
    expiresAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: FeedbackCountAggregateOutputType | null
    _avg: FeedbackAvgAggregateOutputType | null
    _sum: FeedbackSumAggregateOutputType | null
    _min: FeedbackMinAggregateOutputType | null
    _max: FeedbackMaxAggregateOutputType | null
  }

  type GetFeedbackGroupByPayload<T extends FeedbackGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FeedbackGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FeedbackGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FeedbackGroupByOutputType[P]>
            : GetScalarType<T[P], FeedbackGroupByOutputType[P]>
        }
      >
    >


  export type FeedbackSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    userId?: boolean
    summary?: boolean
    strengths?: boolean
    areasForImprovement?: boolean
    fillerWordCount?: boolean
    transcriptScore?: boolean
    structuredData?: boolean
    clarityScore?: boolean
    concisenessScore?: boolean
    technicalDepthScore?: boolean
    starMethodScore?: boolean
    overallScore?: boolean
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: boolean
    toneAnalysis?: boolean
    keywordRelevanceScore?: boolean
    sentimentProgression?: boolean
    enhancedGeneratedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | InterviewSessionDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["feedback"]>

  export type FeedbackSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    userId?: boolean
    summary?: boolean
    strengths?: boolean
    areasForImprovement?: boolean
    fillerWordCount?: boolean
    transcriptScore?: boolean
    structuredData?: boolean
    clarityScore?: boolean
    concisenessScore?: boolean
    technicalDepthScore?: boolean
    starMethodScore?: boolean
    overallScore?: boolean
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: boolean
    toneAnalysis?: boolean
    keywordRelevanceScore?: boolean
    sentimentProgression?: boolean
    enhancedGeneratedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | InterviewSessionDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["feedback"]>

  export type FeedbackSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    userId?: boolean
    summary?: boolean
    strengths?: boolean
    areasForImprovement?: boolean
    fillerWordCount?: boolean
    transcriptScore?: boolean
    structuredData?: boolean
    clarityScore?: boolean
    concisenessScore?: boolean
    technicalDepthScore?: boolean
    starMethodScore?: boolean
    overallScore?: boolean
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: boolean
    toneAnalysis?: boolean
    keywordRelevanceScore?: boolean
    sentimentProgression?: boolean
    enhancedGeneratedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | InterviewSessionDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["feedback"]>

  export type FeedbackSelectScalar = {
    id?: boolean
    sessionId?: boolean
    userId?: boolean
    summary?: boolean
    strengths?: boolean
    areasForImprovement?: boolean
    fillerWordCount?: boolean
    transcriptScore?: boolean
    structuredData?: boolean
    clarityScore?: boolean
    concisenessScore?: boolean
    technicalDepthScore?: boolean
    starMethodScore?: boolean
    overallScore?: boolean
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: boolean
    toneAnalysis?: boolean
    keywordRelevanceScore?: boolean
    sentimentProgression?: boolean
    enhancedGeneratedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FeedbackOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionId" | "userId" | "summary" | "strengths" | "areasForImprovement" | "fillerWordCount" | "transcriptScore" | "structuredData" | "clarityScore" | "concisenessScore" | "technicalDepthScore" | "starMethodScore" | "overallScore" | "enhancedFeedbackGenerated" | "enhancedReportData" | "toneAnalysis" | "keywordRelevanceScore" | "sentimentProgression" | "enhancedGeneratedAt" | "expiresAt" | "createdAt" | "updatedAt", ExtArgs["result"]["feedback"]>
  export type FeedbackInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | InterviewSessionDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FeedbackIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | InterviewSessionDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FeedbackIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | InterviewSessionDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $FeedbackPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Feedback"
    objects: {
      session: Prisma.$InterviewSessionPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      userId: string
      summary: string
      strengths: string | null
      areasForImprovement: string | null
      fillerWordCount: number | null
      transcriptScore: number | null
      structuredData: Prisma.JsonValue | null
      clarityScore: number | null
      concisenessScore: number | null
      technicalDepthScore: number | null
      starMethodScore: number | null
      overallScore: number | null
      enhancedFeedbackGenerated: boolean
      enhancedReportData: Prisma.JsonValue | null
      toneAnalysis: Prisma.JsonValue | null
      keywordRelevanceScore: number | null
      sentimentProgression: Prisma.JsonValue | null
      enhancedGeneratedAt: Date | null
      expiresAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["feedback"]>
    composites: {}
  }

  type FeedbackGetPayload<S extends boolean | null | undefined | FeedbackDefaultArgs> = $Result.GetResult<Prisma.$FeedbackPayload, S>

  type FeedbackCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FeedbackFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FeedbackCountAggregateInputType | true
    }

  export interface FeedbackDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Feedback'], meta: { name: 'Feedback' } }
    /**
     * Find zero or one Feedback that matches the filter.
     * @param {FeedbackFindUniqueArgs} args - Arguments to find a Feedback
     * @example
     * // Get one Feedback
     * const feedback = await prisma.feedback.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FeedbackFindUniqueArgs>(args: SelectSubset<T, FeedbackFindUniqueArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Feedback that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FeedbackFindUniqueOrThrowArgs} args - Arguments to find a Feedback
     * @example
     * // Get one Feedback
     * const feedback = await prisma.feedback.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FeedbackFindUniqueOrThrowArgs>(args: SelectSubset<T, FeedbackFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Feedback that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackFindFirstArgs} args - Arguments to find a Feedback
     * @example
     * // Get one Feedback
     * const feedback = await prisma.feedback.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FeedbackFindFirstArgs>(args?: SelectSubset<T, FeedbackFindFirstArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Feedback that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackFindFirstOrThrowArgs} args - Arguments to find a Feedback
     * @example
     * // Get one Feedback
     * const feedback = await prisma.feedback.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FeedbackFindFirstOrThrowArgs>(args?: SelectSubset<T, FeedbackFindFirstOrThrowArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Feedbacks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Feedbacks
     * const feedbacks = await prisma.feedback.findMany()
     * 
     * // Get first 10 Feedbacks
     * const feedbacks = await prisma.feedback.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const feedbackWithIdOnly = await prisma.feedback.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FeedbackFindManyArgs>(args?: SelectSubset<T, FeedbackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Feedback.
     * @param {FeedbackCreateArgs} args - Arguments to create a Feedback.
     * @example
     * // Create one Feedback
     * const Feedback = await prisma.feedback.create({
     *   data: {
     *     // ... data to create a Feedback
     *   }
     * })
     * 
     */
    create<T extends FeedbackCreateArgs>(args: SelectSubset<T, FeedbackCreateArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Feedbacks.
     * @param {FeedbackCreateManyArgs} args - Arguments to create many Feedbacks.
     * @example
     * // Create many Feedbacks
     * const feedback = await prisma.feedback.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FeedbackCreateManyArgs>(args?: SelectSubset<T, FeedbackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Feedbacks and returns the data saved in the database.
     * @param {FeedbackCreateManyAndReturnArgs} args - Arguments to create many Feedbacks.
     * @example
     * // Create many Feedbacks
     * const feedback = await prisma.feedback.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Feedbacks and only return the `id`
     * const feedbackWithIdOnly = await prisma.feedback.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FeedbackCreateManyAndReturnArgs>(args?: SelectSubset<T, FeedbackCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Feedback.
     * @param {FeedbackDeleteArgs} args - Arguments to delete one Feedback.
     * @example
     * // Delete one Feedback
     * const Feedback = await prisma.feedback.delete({
     *   where: {
     *     // ... filter to delete one Feedback
     *   }
     * })
     * 
     */
    delete<T extends FeedbackDeleteArgs>(args: SelectSubset<T, FeedbackDeleteArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Feedback.
     * @param {FeedbackUpdateArgs} args - Arguments to update one Feedback.
     * @example
     * // Update one Feedback
     * const feedback = await prisma.feedback.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FeedbackUpdateArgs>(args: SelectSubset<T, FeedbackUpdateArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Feedbacks.
     * @param {FeedbackDeleteManyArgs} args - Arguments to filter Feedbacks to delete.
     * @example
     * // Delete a few Feedbacks
     * const { count } = await prisma.feedback.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FeedbackDeleteManyArgs>(args?: SelectSubset<T, FeedbackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Feedbacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Feedbacks
     * const feedback = await prisma.feedback.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FeedbackUpdateManyArgs>(args: SelectSubset<T, FeedbackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Feedbacks and returns the data updated in the database.
     * @param {FeedbackUpdateManyAndReturnArgs} args - Arguments to update many Feedbacks.
     * @example
     * // Update many Feedbacks
     * const feedback = await prisma.feedback.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Feedbacks and only return the `id`
     * const feedbackWithIdOnly = await prisma.feedback.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FeedbackUpdateManyAndReturnArgs>(args: SelectSubset<T, FeedbackUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Feedback.
     * @param {FeedbackUpsertArgs} args - Arguments to update or create a Feedback.
     * @example
     * // Update or create a Feedback
     * const feedback = await prisma.feedback.upsert({
     *   create: {
     *     // ... data to create a Feedback
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Feedback we want to update
     *   }
     * })
     */
    upsert<T extends FeedbackUpsertArgs>(args: SelectSubset<T, FeedbackUpsertArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Feedbacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackCountArgs} args - Arguments to filter Feedbacks to count.
     * @example
     * // Count the number of Feedbacks
     * const count = await prisma.feedback.count({
     *   where: {
     *     // ... the filter for the Feedbacks we want to count
     *   }
     * })
    **/
    count<T extends FeedbackCountArgs>(
      args?: Subset<T, FeedbackCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FeedbackCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Feedback.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FeedbackAggregateArgs>(args: Subset<T, FeedbackAggregateArgs>): Prisma.PrismaPromise<GetFeedbackAggregateType<T>>

    /**
     * Group by Feedback.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FeedbackGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FeedbackGroupByArgs['orderBy'] }
        : { orderBy?: FeedbackGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FeedbackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFeedbackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Feedback model
   */
  readonly fields: FeedbackFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Feedback.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FeedbackClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    session<T extends InterviewSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InterviewSessionDefaultArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Feedback model
   */
  interface FeedbackFieldRefs {
    readonly id: FieldRef<"Feedback", 'String'>
    readonly sessionId: FieldRef<"Feedback", 'String'>
    readonly userId: FieldRef<"Feedback", 'String'>
    readonly summary: FieldRef<"Feedback", 'String'>
    readonly strengths: FieldRef<"Feedback", 'String'>
    readonly areasForImprovement: FieldRef<"Feedback", 'String'>
    readonly fillerWordCount: FieldRef<"Feedback", 'Int'>
    readonly transcriptScore: FieldRef<"Feedback", 'Float'>
    readonly structuredData: FieldRef<"Feedback", 'Json'>
    readonly clarityScore: FieldRef<"Feedback", 'Float'>
    readonly concisenessScore: FieldRef<"Feedback", 'Float'>
    readonly technicalDepthScore: FieldRef<"Feedback", 'Float'>
    readonly starMethodScore: FieldRef<"Feedback", 'Float'>
    readonly overallScore: FieldRef<"Feedback", 'Float'>
    readonly enhancedFeedbackGenerated: FieldRef<"Feedback", 'Boolean'>
    readonly enhancedReportData: FieldRef<"Feedback", 'Json'>
    readonly toneAnalysis: FieldRef<"Feedback", 'Json'>
    readonly keywordRelevanceScore: FieldRef<"Feedback", 'Float'>
    readonly sentimentProgression: FieldRef<"Feedback", 'Json'>
    readonly enhancedGeneratedAt: FieldRef<"Feedback", 'DateTime'>
    readonly expiresAt: FieldRef<"Feedback", 'DateTime'>
    readonly createdAt: FieldRef<"Feedback", 'DateTime'>
    readonly updatedAt: FieldRef<"Feedback", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Feedback findUnique
   */
  export type FeedbackFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackInclude<ExtArgs> | null
    /**
     * Filter, which Feedback to fetch.
     */
    where: FeedbackWhereUniqueInput
  }

  /**
   * Feedback findUniqueOrThrow
   */
  export type FeedbackFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackInclude<ExtArgs> | null
    /**
     * Filter, which Feedback to fetch.
     */
    where: FeedbackWhereUniqueInput
  }

  /**
   * Feedback findFirst
   */
  export type FeedbackFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackInclude<ExtArgs> | null
    /**
     * Filter, which Feedback to fetch.
     */
    where?: FeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Feedbacks to fetch.
     */
    orderBy?: FeedbackOrderByWithRelationInput | FeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Feedbacks.
     */
    cursor?: FeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Feedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Feedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Feedbacks.
     */
    distinct?: FeedbackScalarFieldEnum | FeedbackScalarFieldEnum[]
  }

  /**
   * Feedback findFirstOrThrow
   */
  export type FeedbackFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackInclude<ExtArgs> | null
    /**
     * Filter, which Feedback to fetch.
     */
    where?: FeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Feedbacks to fetch.
     */
    orderBy?: FeedbackOrderByWithRelationInput | FeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Feedbacks.
     */
    cursor?: FeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Feedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Feedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Feedbacks.
     */
    distinct?: FeedbackScalarFieldEnum | FeedbackScalarFieldEnum[]
  }

  /**
   * Feedback findMany
   */
  export type FeedbackFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackInclude<ExtArgs> | null
    /**
     * Filter, which Feedbacks to fetch.
     */
    where?: FeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Feedbacks to fetch.
     */
    orderBy?: FeedbackOrderByWithRelationInput | FeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Feedbacks.
     */
    cursor?: FeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Feedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Feedbacks.
     */
    skip?: number
    distinct?: FeedbackScalarFieldEnum | FeedbackScalarFieldEnum[]
  }

  /**
   * Feedback create
   */
  export type FeedbackCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackInclude<ExtArgs> | null
    /**
     * The data needed to create a Feedback.
     */
    data: XOR<FeedbackCreateInput, FeedbackUncheckedCreateInput>
  }

  /**
   * Feedback createMany
   */
  export type FeedbackCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Feedbacks.
     */
    data: FeedbackCreateManyInput | FeedbackCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Feedback createManyAndReturn
   */
  export type FeedbackCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * The data used to create many Feedbacks.
     */
    data: FeedbackCreateManyInput | FeedbackCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Feedback update
   */
  export type FeedbackUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackInclude<ExtArgs> | null
    /**
     * The data needed to update a Feedback.
     */
    data: XOR<FeedbackUpdateInput, FeedbackUncheckedUpdateInput>
    /**
     * Choose, which Feedback to update.
     */
    where: FeedbackWhereUniqueInput
  }

  /**
   * Feedback updateMany
   */
  export type FeedbackUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Feedbacks.
     */
    data: XOR<FeedbackUpdateManyMutationInput, FeedbackUncheckedUpdateManyInput>
    /**
     * Filter which Feedbacks to update
     */
    where?: FeedbackWhereInput
    /**
     * Limit how many Feedbacks to update.
     */
    limit?: number
  }

  /**
   * Feedback updateManyAndReturn
   */
  export type FeedbackUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * The data used to update Feedbacks.
     */
    data: XOR<FeedbackUpdateManyMutationInput, FeedbackUncheckedUpdateManyInput>
    /**
     * Filter which Feedbacks to update
     */
    where?: FeedbackWhereInput
    /**
     * Limit how many Feedbacks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Feedback upsert
   */
  export type FeedbackUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackInclude<ExtArgs> | null
    /**
     * The filter to search for the Feedback to update in case it exists.
     */
    where: FeedbackWhereUniqueInput
    /**
     * In case the Feedback found by the `where` argument doesn't exist, create a new Feedback with this data.
     */
    create: XOR<FeedbackCreateInput, FeedbackUncheckedCreateInput>
    /**
     * In case the Feedback was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FeedbackUpdateInput, FeedbackUncheckedUpdateInput>
  }

  /**
   * Feedback delete
   */
  export type FeedbackDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackInclude<ExtArgs> | null
    /**
     * Filter which Feedback to delete.
     */
    where: FeedbackWhereUniqueInput
  }

  /**
   * Feedback deleteMany
   */
  export type FeedbackDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Feedbacks to delete
     */
    where?: FeedbackWhereInput
    /**
     * Limit how many Feedbacks to delete.
     */
    limit?: number
  }

  /**
   * Feedback without action
   */
  export type FeedbackDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeedbackInclude<ExtArgs> | null
  }


  /**
   * Model UsageEvent
   */

  export type AggregateUsageEvent = {
    _count: UsageEventCountAggregateOutputType | null
    _min: UsageEventMinAggregateOutputType | null
    _max: UsageEventMaxAggregateOutputType | null
  }

  export type UsageEventMinAggregateOutputType = {
    id: string | null
    userId: string | null
    eventType: string | null
    occurredAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UsageEventMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    eventType: string | null
    occurredAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UsageEventCountAggregateOutputType = {
    id: number
    userId: number
    eventType: number
    details: number
    occurredAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UsageEventMinAggregateInputType = {
    id?: true
    userId?: true
    eventType?: true
    occurredAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UsageEventMaxAggregateInputType = {
    id?: true
    userId?: true
    eventType?: true
    occurredAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UsageEventCountAggregateInputType = {
    id?: true
    userId?: true
    eventType?: true
    details?: true
    occurredAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UsageEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UsageEvent to aggregate.
     */
    where?: UsageEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsageEvents to fetch.
     */
    orderBy?: UsageEventOrderByWithRelationInput | UsageEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UsageEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsageEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsageEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UsageEvents
    **/
    _count?: true | UsageEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsageEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsageEventMaxAggregateInputType
  }

  export type GetUsageEventAggregateType<T extends UsageEventAggregateArgs> = {
        [P in keyof T & keyof AggregateUsageEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsageEvent[P]>
      : GetScalarType<T[P], AggregateUsageEvent[P]>
  }




  export type UsageEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsageEventWhereInput
    orderBy?: UsageEventOrderByWithAggregationInput | UsageEventOrderByWithAggregationInput[]
    by: UsageEventScalarFieldEnum[] | UsageEventScalarFieldEnum
    having?: UsageEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsageEventCountAggregateInputType | true
    _min?: UsageEventMinAggregateInputType
    _max?: UsageEventMaxAggregateInputType
  }

  export type UsageEventGroupByOutputType = {
    id: string
    userId: string | null
    eventType: string
    details: JsonValue | null
    occurredAt: Date
    createdAt: Date
    updatedAt: Date
    _count: UsageEventCountAggregateOutputType | null
    _min: UsageEventMinAggregateOutputType | null
    _max: UsageEventMaxAggregateOutputType | null
  }

  type GetUsageEventGroupByPayload<T extends UsageEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsageEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsageEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsageEventGroupByOutputType[P]>
            : GetScalarType<T[P], UsageEventGroupByOutputType[P]>
        }
      >
    >


  export type UsageEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    eventType?: boolean
    details?: boolean
    occurredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UsageEvent$userArgs<ExtArgs>
  }, ExtArgs["result"]["usageEvent"]>

  export type UsageEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    eventType?: boolean
    details?: boolean
    occurredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UsageEvent$userArgs<ExtArgs>
  }, ExtArgs["result"]["usageEvent"]>

  export type UsageEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    eventType?: boolean
    details?: boolean
    occurredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UsageEvent$userArgs<ExtArgs>
  }, ExtArgs["result"]["usageEvent"]>

  export type UsageEventSelectScalar = {
    id?: boolean
    userId?: boolean
    eventType?: boolean
    details?: boolean
    occurredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UsageEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "eventType" | "details" | "occurredAt" | "createdAt" | "updatedAt", ExtArgs["result"]["usageEvent"]>
  export type UsageEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsageEvent$userArgs<ExtArgs>
  }
  export type UsageEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsageEvent$userArgs<ExtArgs>
  }
  export type UsageEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsageEvent$userArgs<ExtArgs>
  }

  export type $UsageEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UsageEvent"
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string | null
      eventType: string
      details: Prisma.JsonValue | null
      occurredAt: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["usageEvent"]>
    composites: {}
  }

  type UsageEventGetPayload<S extends boolean | null | undefined | UsageEventDefaultArgs> = $Result.GetResult<Prisma.$UsageEventPayload, S>

  type UsageEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UsageEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsageEventCountAggregateInputType | true
    }

  export interface UsageEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UsageEvent'], meta: { name: 'UsageEvent' } }
    /**
     * Find zero or one UsageEvent that matches the filter.
     * @param {UsageEventFindUniqueArgs} args - Arguments to find a UsageEvent
     * @example
     * // Get one UsageEvent
     * const usageEvent = await prisma.usageEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsageEventFindUniqueArgs>(args: SelectSubset<T, UsageEventFindUniqueArgs<ExtArgs>>): Prisma__UsageEventClient<$Result.GetResult<Prisma.$UsageEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UsageEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UsageEventFindUniqueOrThrowArgs} args - Arguments to find a UsageEvent
     * @example
     * // Get one UsageEvent
     * const usageEvent = await prisma.usageEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsageEventFindUniqueOrThrowArgs>(args: SelectSubset<T, UsageEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UsageEventClient<$Result.GetResult<Prisma.$UsageEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UsageEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageEventFindFirstArgs} args - Arguments to find a UsageEvent
     * @example
     * // Get one UsageEvent
     * const usageEvent = await prisma.usageEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsageEventFindFirstArgs>(args?: SelectSubset<T, UsageEventFindFirstArgs<ExtArgs>>): Prisma__UsageEventClient<$Result.GetResult<Prisma.$UsageEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UsageEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageEventFindFirstOrThrowArgs} args - Arguments to find a UsageEvent
     * @example
     * // Get one UsageEvent
     * const usageEvent = await prisma.usageEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsageEventFindFirstOrThrowArgs>(args?: SelectSubset<T, UsageEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__UsageEventClient<$Result.GetResult<Prisma.$UsageEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UsageEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UsageEvents
     * const usageEvents = await prisma.usageEvent.findMany()
     * 
     * // Get first 10 UsageEvents
     * const usageEvents = await prisma.usageEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usageEventWithIdOnly = await prisma.usageEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UsageEventFindManyArgs>(args?: SelectSubset<T, UsageEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsageEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UsageEvent.
     * @param {UsageEventCreateArgs} args - Arguments to create a UsageEvent.
     * @example
     * // Create one UsageEvent
     * const UsageEvent = await prisma.usageEvent.create({
     *   data: {
     *     // ... data to create a UsageEvent
     *   }
     * })
     * 
     */
    create<T extends UsageEventCreateArgs>(args: SelectSubset<T, UsageEventCreateArgs<ExtArgs>>): Prisma__UsageEventClient<$Result.GetResult<Prisma.$UsageEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UsageEvents.
     * @param {UsageEventCreateManyArgs} args - Arguments to create many UsageEvents.
     * @example
     * // Create many UsageEvents
     * const usageEvent = await prisma.usageEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UsageEventCreateManyArgs>(args?: SelectSubset<T, UsageEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UsageEvents and returns the data saved in the database.
     * @param {UsageEventCreateManyAndReturnArgs} args - Arguments to create many UsageEvents.
     * @example
     * // Create many UsageEvents
     * const usageEvent = await prisma.usageEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UsageEvents and only return the `id`
     * const usageEventWithIdOnly = await prisma.usageEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UsageEventCreateManyAndReturnArgs>(args?: SelectSubset<T, UsageEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsageEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UsageEvent.
     * @param {UsageEventDeleteArgs} args - Arguments to delete one UsageEvent.
     * @example
     * // Delete one UsageEvent
     * const UsageEvent = await prisma.usageEvent.delete({
     *   where: {
     *     // ... filter to delete one UsageEvent
     *   }
     * })
     * 
     */
    delete<T extends UsageEventDeleteArgs>(args: SelectSubset<T, UsageEventDeleteArgs<ExtArgs>>): Prisma__UsageEventClient<$Result.GetResult<Prisma.$UsageEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UsageEvent.
     * @param {UsageEventUpdateArgs} args - Arguments to update one UsageEvent.
     * @example
     * // Update one UsageEvent
     * const usageEvent = await prisma.usageEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UsageEventUpdateArgs>(args: SelectSubset<T, UsageEventUpdateArgs<ExtArgs>>): Prisma__UsageEventClient<$Result.GetResult<Prisma.$UsageEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UsageEvents.
     * @param {UsageEventDeleteManyArgs} args - Arguments to filter UsageEvents to delete.
     * @example
     * // Delete a few UsageEvents
     * const { count } = await prisma.usageEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UsageEventDeleteManyArgs>(args?: SelectSubset<T, UsageEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UsageEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UsageEvents
     * const usageEvent = await prisma.usageEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UsageEventUpdateManyArgs>(args: SelectSubset<T, UsageEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UsageEvents and returns the data updated in the database.
     * @param {UsageEventUpdateManyAndReturnArgs} args - Arguments to update many UsageEvents.
     * @example
     * // Update many UsageEvents
     * const usageEvent = await prisma.usageEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UsageEvents and only return the `id`
     * const usageEventWithIdOnly = await prisma.usageEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UsageEventUpdateManyAndReturnArgs>(args: SelectSubset<T, UsageEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsageEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UsageEvent.
     * @param {UsageEventUpsertArgs} args - Arguments to update or create a UsageEvent.
     * @example
     * // Update or create a UsageEvent
     * const usageEvent = await prisma.usageEvent.upsert({
     *   create: {
     *     // ... data to create a UsageEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UsageEvent we want to update
     *   }
     * })
     */
    upsert<T extends UsageEventUpsertArgs>(args: SelectSubset<T, UsageEventUpsertArgs<ExtArgs>>): Prisma__UsageEventClient<$Result.GetResult<Prisma.$UsageEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UsageEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageEventCountArgs} args - Arguments to filter UsageEvents to count.
     * @example
     * // Count the number of UsageEvents
     * const count = await prisma.usageEvent.count({
     *   where: {
     *     // ... the filter for the UsageEvents we want to count
     *   }
     * })
    **/
    count<T extends UsageEventCountArgs>(
      args?: Subset<T, UsageEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsageEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UsageEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsageEventAggregateArgs>(args: Subset<T, UsageEventAggregateArgs>): Prisma.PrismaPromise<GetUsageEventAggregateType<T>>

    /**
     * Group by UsageEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UsageEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UsageEventGroupByArgs['orderBy'] }
        : { orderBy?: UsageEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UsageEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsageEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UsageEvent model
   */
  readonly fields: UsageEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UsageEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UsageEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UsageEvent$userArgs<ExtArgs> = {}>(args?: Subset<T, UsageEvent$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UsageEvent model
   */
  interface UsageEventFieldRefs {
    readonly id: FieldRef<"UsageEvent", 'String'>
    readonly userId: FieldRef<"UsageEvent", 'String'>
    readonly eventType: FieldRef<"UsageEvent", 'String'>
    readonly details: FieldRef<"UsageEvent", 'Json'>
    readonly occurredAt: FieldRef<"UsageEvent", 'DateTime'>
    readonly createdAt: FieldRef<"UsageEvent", 'DateTime'>
    readonly updatedAt: FieldRef<"UsageEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UsageEvent findUnique
   */
  export type UsageEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventInclude<ExtArgs> | null
    /**
     * Filter, which UsageEvent to fetch.
     */
    where: UsageEventWhereUniqueInput
  }

  /**
   * UsageEvent findUniqueOrThrow
   */
  export type UsageEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventInclude<ExtArgs> | null
    /**
     * Filter, which UsageEvent to fetch.
     */
    where: UsageEventWhereUniqueInput
  }

  /**
   * UsageEvent findFirst
   */
  export type UsageEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventInclude<ExtArgs> | null
    /**
     * Filter, which UsageEvent to fetch.
     */
    where?: UsageEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsageEvents to fetch.
     */
    orderBy?: UsageEventOrderByWithRelationInput | UsageEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UsageEvents.
     */
    cursor?: UsageEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsageEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsageEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UsageEvents.
     */
    distinct?: UsageEventScalarFieldEnum | UsageEventScalarFieldEnum[]
  }

  /**
   * UsageEvent findFirstOrThrow
   */
  export type UsageEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventInclude<ExtArgs> | null
    /**
     * Filter, which UsageEvent to fetch.
     */
    where?: UsageEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsageEvents to fetch.
     */
    orderBy?: UsageEventOrderByWithRelationInput | UsageEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UsageEvents.
     */
    cursor?: UsageEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsageEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsageEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UsageEvents.
     */
    distinct?: UsageEventScalarFieldEnum | UsageEventScalarFieldEnum[]
  }

  /**
   * UsageEvent findMany
   */
  export type UsageEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventInclude<ExtArgs> | null
    /**
     * Filter, which UsageEvents to fetch.
     */
    where?: UsageEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsageEvents to fetch.
     */
    orderBy?: UsageEventOrderByWithRelationInput | UsageEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UsageEvents.
     */
    cursor?: UsageEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsageEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsageEvents.
     */
    skip?: number
    distinct?: UsageEventScalarFieldEnum | UsageEventScalarFieldEnum[]
  }

  /**
   * UsageEvent create
   */
  export type UsageEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventInclude<ExtArgs> | null
    /**
     * The data needed to create a UsageEvent.
     */
    data: XOR<UsageEventCreateInput, UsageEventUncheckedCreateInput>
  }

  /**
   * UsageEvent createMany
   */
  export type UsageEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UsageEvents.
     */
    data: UsageEventCreateManyInput | UsageEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UsageEvent createManyAndReturn
   */
  export type UsageEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * The data used to create many UsageEvents.
     */
    data: UsageEventCreateManyInput | UsageEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UsageEvent update
   */
  export type UsageEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventInclude<ExtArgs> | null
    /**
     * The data needed to update a UsageEvent.
     */
    data: XOR<UsageEventUpdateInput, UsageEventUncheckedUpdateInput>
    /**
     * Choose, which UsageEvent to update.
     */
    where: UsageEventWhereUniqueInput
  }

  /**
   * UsageEvent updateMany
   */
  export type UsageEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UsageEvents.
     */
    data: XOR<UsageEventUpdateManyMutationInput, UsageEventUncheckedUpdateManyInput>
    /**
     * Filter which UsageEvents to update
     */
    where?: UsageEventWhereInput
    /**
     * Limit how many UsageEvents to update.
     */
    limit?: number
  }

  /**
   * UsageEvent updateManyAndReturn
   */
  export type UsageEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * The data used to update UsageEvents.
     */
    data: XOR<UsageEventUpdateManyMutationInput, UsageEventUncheckedUpdateManyInput>
    /**
     * Filter which UsageEvents to update
     */
    where?: UsageEventWhereInput
    /**
     * Limit how many UsageEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UsageEvent upsert
   */
  export type UsageEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventInclude<ExtArgs> | null
    /**
     * The filter to search for the UsageEvent to update in case it exists.
     */
    where: UsageEventWhereUniqueInput
    /**
     * In case the UsageEvent found by the `where` argument doesn't exist, create a new UsageEvent with this data.
     */
    create: XOR<UsageEventCreateInput, UsageEventUncheckedCreateInput>
    /**
     * In case the UsageEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UsageEventUpdateInput, UsageEventUncheckedUpdateInput>
  }

  /**
   * UsageEvent delete
   */
  export type UsageEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventInclude<ExtArgs> | null
    /**
     * Filter which UsageEvent to delete.
     */
    where: UsageEventWhereUniqueInput
  }

  /**
   * UsageEvent deleteMany
   */
  export type UsageEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UsageEvents to delete
     */
    where?: UsageEventWhereInput
    /**
     * Limit how many UsageEvents to delete.
     */
    limit?: number
  }

  /**
   * UsageEvent.user
   */
  export type UsageEvent$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * UsageEvent without action
   */
  export type UsageEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageEvent
     */
    select?: UsageEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsageEvent
     */
    omit?: UsageEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageEventInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    clerkId: 'clerkId',
    role: 'role',
    credits: 'credits',
    resumeJobTitle: 'resumeJobTitle',
    resumeSkills: 'resumeSkills',
    resumeExperience: 'resumeExperience',
    resumeEducation: 'resumeEducation',
    resumeAchievements: 'resumeAchievements',
    resumeFileUrl: 'resumeFileUrl',
    jobSearchStage: 'jobSearchStage',
    linkedinUrl: 'linkedinUrl',
    acceptedTermsAt: 'acceptedTermsAt',
    acceptedPrivacyAt: 'acceptedPrivacyAt',
    dataRetentionOverride: 'dataRetentionOverride',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    premiumExpiresAt: 'premiumExpiresAt',
    premiumSubscriptionId: 'premiumSubscriptionId',
    stripeCustomerId: 'stripeCustomerId',
    isPremium: 'isPremium',
    email: 'email',
    image: 'image',
    name: 'name'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const InterviewSessionScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    jobTitle: 'jobTitle',
    resumeData: 'resumeData',
    resumeSnapshot: 'resumeSnapshot',
    company: 'company',
    interviewType: 'interviewType',
    jdContext: 'jdContext',
    openaiSessionId: 'openaiSessionId',
    fallbackMode: 'fallbackMode',
    startTime: 'startTime',
    endTime: 'endTime',
    duration: 'duration',
    status: 'status',
    feedbackStatus: 'feedbackStatus',
    metadata: 'metadata',
    startedAt: 'startedAt',
    endedAt: 'endedAt',
    durationSeconds: 'durationSeconds',
    audioUrl: 'audioUrl',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type InterviewSessionScalarFieldEnum = (typeof InterviewSessionScalarFieldEnum)[keyof typeof InterviewSessionScalarFieldEnum]


  export const TranscriptScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    role: 'role',
    content: 'content',
    confidence: 'confidence',
    timestamp: 'timestamp',
    sequenceNumber: 'sequenceNumber',
    metadata: 'metadata',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TranscriptScalarFieldEnum = (typeof TranscriptScalarFieldEnum)[keyof typeof TranscriptScalarFieldEnum]


  export const FeedbackScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    userId: 'userId',
    summary: 'summary',
    strengths: 'strengths',
    areasForImprovement: 'areasForImprovement',
    fillerWordCount: 'fillerWordCount',
    transcriptScore: 'transcriptScore',
    structuredData: 'structuredData',
    clarityScore: 'clarityScore',
    concisenessScore: 'concisenessScore',
    technicalDepthScore: 'technicalDepthScore',
    starMethodScore: 'starMethodScore',
    overallScore: 'overallScore',
    enhancedFeedbackGenerated: 'enhancedFeedbackGenerated',
    enhancedReportData: 'enhancedReportData',
    toneAnalysis: 'toneAnalysis',
    keywordRelevanceScore: 'keywordRelevanceScore',
    sentimentProgression: 'sentimentProgression',
    enhancedGeneratedAt: 'enhancedGeneratedAt',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FeedbackScalarFieldEnum = (typeof FeedbackScalarFieldEnum)[keyof typeof FeedbackScalarFieldEnum]


  export const UsageEventScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    eventType: 'eventType',
    details: 'details',
    occurredAt: 'occurredAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UsageEventScalarFieldEnum = (typeof UsageEventScalarFieldEnum)[keyof typeof UsageEventScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    clerkId?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    credits?: DecimalFilter<"User"> | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: StringNullableFilter<"User"> | string | null
    resumeSkills?: StringNullableFilter<"User"> | string | null
    resumeExperience?: StringNullableFilter<"User"> | string | null
    resumeEducation?: StringNullableFilter<"User"> | string | null
    resumeAchievements?: StringNullableFilter<"User"> | string | null
    resumeFileUrl?: StringNullableFilter<"User"> | string | null
    jobSearchStage?: StringNullableFilter<"User"> | string | null
    linkedinUrl?: StringNullableFilter<"User"> | string | null
    acceptedTermsAt?: DateTimeNullableFilter<"User"> | Date | string | null
    acceptedPrivacyAt?: DateTimeNullableFilter<"User"> | Date | string | null
    dataRetentionOverride?: BoolNullableFilter<"User"> | boolean | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    premiumExpiresAt?: DateTimeNullableFilter<"User"> | Date | string | null
    premiumSubscriptionId?: StringNullableFilter<"User"> | string | null
    stripeCustomerId?: StringNullableFilter<"User"> | string | null
    isPremium?: BoolFilter<"User"> | boolean
    email?: StringNullableFilter<"User"> | string | null
    image?: StringNullableFilter<"User"> | string | null
    name?: StringNullableFilter<"User"> | string | null
    feedbacks?: FeedbackListRelationFilter
    interviewSessions?: InterviewSessionListRelationFilter
    usageEvents?: UsageEventListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    clerkId?: SortOrder
    role?: SortOrder
    credits?: SortOrder
    resumeJobTitle?: SortOrderInput | SortOrder
    resumeSkills?: SortOrderInput | SortOrder
    resumeExperience?: SortOrderInput | SortOrder
    resumeEducation?: SortOrderInput | SortOrder
    resumeAchievements?: SortOrderInput | SortOrder
    resumeFileUrl?: SortOrderInput | SortOrder
    jobSearchStage?: SortOrderInput | SortOrder
    linkedinUrl?: SortOrderInput | SortOrder
    acceptedTermsAt?: SortOrderInput | SortOrder
    acceptedPrivacyAt?: SortOrderInput | SortOrder
    dataRetentionOverride?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    premiumExpiresAt?: SortOrderInput | SortOrder
    premiumSubscriptionId?: SortOrderInput | SortOrder
    stripeCustomerId?: SortOrderInput | SortOrder
    isPremium?: SortOrder
    email?: SortOrderInput | SortOrder
    image?: SortOrderInput | SortOrder
    name?: SortOrderInput | SortOrder
    feedbacks?: FeedbackOrderByRelationAggregateInput
    interviewSessions?: InterviewSessionOrderByRelationAggregateInput
    usageEvents?: UsageEventOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    clerkId?: string
    premiumSubscriptionId?: string
    stripeCustomerId?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    credits?: DecimalFilter<"User"> | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: StringNullableFilter<"User"> | string | null
    resumeSkills?: StringNullableFilter<"User"> | string | null
    resumeExperience?: StringNullableFilter<"User"> | string | null
    resumeEducation?: StringNullableFilter<"User"> | string | null
    resumeAchievements?: StringNullableFilter<"User"> | string | null
    resumeFileUrl?: StringNullableFilter<"User"> | string | null
    jobSearchStage?: StringNullableFilter<"User"> | string | null
    linkedinUrl?: StringNullableFilter<"User"> | string | null
    acceptedTermsAt?: DateTimeNullableFilter<"User"> | Date | string | null
    acceptedPrivacyAt?: DateTimeNullableFilter<"User"> | Date | string | null
    dataRetentionOverride?: BoolNullableFilter<"User"> | boolean | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    premiumExpiresAt?: DateTimeNullableFilter<"User"> | Date | string | null
    isPremium?: BoolFilter<"User"> | boolean
    image?: StringNullableFilter<"User"> | string | null
    name?: StringNullableFilter<"User"> | string | null
    feedbacks?: FeedbackListRelationFilter
    interviewSessions?: InterviewSessionListRelationFilter
    usageEvents?: UsageEventListRelationFilter
  }, "id" | "id" | "clerkId" | "premiumSubscriptionId" | "stripeCustomerId" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    clerkId?: SortOrder
    role?: SortOrder
    credits?: SortOrder
    resumeJobTitle?: SortOrderInput | SortOrder
    resumeSkills?: SortOrderInput | SortOrder
    resumeExperience?: SortOrderInput | SortOrder
    resumeEducation?: SortOrderInput | SortOrder
    resumeAchievements?: SortOrderInput | SortOrder
    resumeFileUrl?: SortOrderInput | SortOrder
    jobSearchStage?: SortOrderInput | SortOrder
    linkedinUrl?: SortOrderInput | SortOrder
    acceptedTermsAt?: SortOrderInput | SortOrder
    acceptedPrivacyAt?: SortOrderInput | SortOrder
    dataRetentionOverride?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    premiumExpiresAt?: SortOrderInput | SortOrder
    premiumSubscriptionId?: SortOrderInput | SortOrder
    stripeCustomerId?: SortOrderInput | SortOrder
    isPremium?: SortOrder
    email?: SortOrderInput | SortOrder
    image?: SortOrderInput | SortOrder
    name?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    clerkId?: StringWithAggregatesFilter<"User"> | string
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    credits?: DecimalWithAggregatesFilter<"User"> | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: StringNullableWithAggregatesFilter<"User"> | string | null
    resumeSkills?: StringNullableWithAggregatesFilter<"User"> | string | null
    resumeExperience?: StringNullableWithAggregatesFilter<"User"> | string | null
    resumeEducation?: StringNullableWithAggregatesFilter<"User"> | string | null
    resumeAchievements?: StringNullableWithAggregatesFilter<"User"> | string | null
    resumeFileUrl?: StringNullableWithAggregatesFilter<"User"> | string | null
    jobSearchStage?: StringNullableWithAggregatesFilter<"User"> | string | null
    linkedinUrl?: StringNullableWithAggregatesFilter<"User"> | string | null
    acceptedTermsAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    acceptedPrivacyAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    dataRetentionOverride?: BoolNullableWithAggregatesFilter<"User"> | boolean | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    premiumExpiresAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    premiumSubscriptionId?: StringNullableWithAggregatesFilter<"User"> | string | null
    stripeCustomerId?: StringNullableWithAggregatesFilter<"User"> | string | null
    isPremium?: BoolWithAggregatesFilter<"User"> | boolean
    email?: StringNullableWithAggregatesFilter<"User"> | string | null
    image?: StringNullableWithAggregatesFilter<"User"> | string | null
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type InterviewSessionWhereInput = {
    AND?: InterviewSessionWhereInput | InterviewSessionWhereInput[]
    OR?: InterviewSessionWhereInput[]
    NOT?: InterviewSessionWhereInput | InterviewSessionWhereInput[]
    id?: StringFilter<"InterviewSession"> | string
    userId?: StringFilter<"InterviewSession"> | string
    jobTitle?: StringFilter<"InterviewSession"> | string
    resumeData?: JsonNullableFilter<"InterviewSession">
    resumeSnapshot?: JsonNullableFilter<"InterviewSession">
    company?: StringNullableFilter<"InterviewSession"> | string | null
    interviewType?: StringNullableFilter<"InterviewSession"> | string | null
    jdContext?: StringNullableFilter<"InterviewSession"> | string | null
    openaiSessionId?: StringNullableFilter<"InterviewSession"> | string | null
    fallbackMode?: BoolFilter<"InterviewSession"> | boolean
    startTime?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    endTime?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    duration?: IntNullableFilter<"InterviewSession"> | number | null
    status?: StringFilter<"InterviewSession"> | string
    feedbackStatus?: StringFilter<"InterviewSession"> | string
    metadata?: JsonNullableFilter<"InterviewSession">
    startedAt?: DateTimeFilter<"InterviewSession"> | Date | string
    endedAt?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    durationSeconds?: IntNullableFilter<"InterviewSession"> | number | null
    audioUrl?: StringNullableFilter<"InterviewSession"> | string | null
    expiresAt?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    createdAt?: DateTimeFilter<"InterviewSession"> | Date | string
    updatedAt?: DateTimeFilter<"InterviewSession"> | Date | string
    deletedAt?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    feedbacks?: FeedbackListRelationFilter
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    transcripts?: TranscriptListRelationFilter
  }

  export type InterviewSessionOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    jobTitle?: SortOrder
    resumeData?: SortOrderInput | SortOrder
    resumeSnapshot?: SortOrderInput | SortOrder
    company?: SortOrderInput | SortOrder
    interviewType?: SortOrderInput | SortOrder
    jdContext?: SortOrderInput | SortOrder
    openaiSessionId?: SortOrderInput | SortOrder
    fallbackMode?: SortOrder
    startTime?: SortOrderInput | SortOrder
    endTime?: SortOrderInput | SortOrder
    duration?: SortOrderInput | SortOrder
    status?: SortOrder
    feedbackStatus?: SortOrder
    metadata?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrderInput | SortOrder
    durationSeconds?: SortOrderInput | SortOrder
    audioUrl?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    feedbacks?: FeedbackOrderByRelationAggregateInput
    user?: UserOrderByWithRelationInput
    transcripts?: TranscriptOrderByRelationAggregateInput
  }

  export type InterviewSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    openaiSessionId?: string
    AND?: InterviewSessionWhereInput | InterviewSessionWhereInput[]
    OR?: InterviewSessionWhereInput[]
    NOT?: InterviewSessionWhereInput | InterviewSessionWhereInput[]
    userId?: StringFilter<"InterviewSession"> | string
    jobTitle?: StringFilter<"InterviewSession"> | string
    resumeData?: JsonNullableFilter<"InterviewSession">
    resumeSnapshot?: JsonNullableFilter<"InterviewSession">
    company?: StringNullableFilter<"InterviewSession"> | string | null
    interviewType?: StringNullableFilter<"InterviewSession"> | string | null
    jdContext?: StringNullableFilter<"InterviewSession"> | string | null
    fallbackMode?: BoolFilter<"InterviewSession"> | boolean
    startTime?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    endTime?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    duration?: IntNullableFilter<"InterviewSession"> | number | null
    status?: StringFilter<"InterviewSession"> | string
    feedbackStatus?: StringFilter<"InterviewSession"> | string
    metadata?: JsonNullableFilter<"InterviewSession">
    startedAt?: DateTimeFilter<"InterviewSession"> | Date | string
    endedAt?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    durationSeconds?: IntNullableFilter<"InterviewSession"> | number | null
    audioUrl?: StringNullableFilter<"InterviewSession"> | string | null
    expiresAt?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    createdAt?: DateTimeFilter<"InterviewSession"> | Date | string
    updatedAt?: DateTimeFilter<"InterviewSession"> | Date | string
    deletedAt?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    feedbacks?: FeedbackListRelationFilter
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    transcripts?: TranscriptListRelationFilter
  }, "id" | "openaiSessionId">

  export type InterviewSessionOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    jobTitle?: SortOrder
    resumeData?: SortOrderInput | SortOrder
    resumeSnapshot?: SortOrderInput | SortOrder
    company?: SortOrderInput | SortOrder
    interviewType?: SortOrderInput | SortOrder
    jdContext?: SortOrderInput | SortOrder
    openaiSessionId?: SortOrderInput | SortOrder
    fallbackMode?: SortOrder
    startTime?: SortOrderInput | SortOrder
    endTime?: SortOrderInput | SortOrder
    duration?: SortOrderInput | SortOrder
    status?: SortOrder
    feedbackStatus?: SortOrder
    metadata?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrderInput | SortOrder
    durationSeconds?: SortOrderInput | SortOrder
    audioUrl?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: InterviewSessionCountOrderByAggregateInput
    _avg?: InterviewSessionAvgOrderByAggregateInput
    _max?: InterviewSessionMaxOrderByAggregateInput
    _min?: InterviewSessionMinOrderByAggregateInput
    _sum?: InterviewSessionSumOrderByAggregateInput
  }

  export type InterviewSessionScalarWhereWithAggregatesInput = {
    AND?: InterviewSessionScalarWhereWithAggregatesInput | InterviewSessionScalarWhereWithAggregatesInput[]
    OR?: InterviewSessionScalarWhereWithAggregatesInput[]
    NOT?: InterviewSessionScalarWhereWithAggregatesInput | InterviewSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InterviewSession"> | string
    userId?: StringWithAggregatesFilter<"InterviewSession"> | string
    jobTitle?: StringWithAggregatesFilter<"InterviewSession"> | string
    resumeData?: JsonNullableWithAggregatesFilter<"InterviewSession">
    resumeSnapshot?: JsonNullableWithAggregatesFilter<"InterviewSession">
    company?: StringNullableWithAggregatesFilter<"InterviewSession"> | string | null
    interviewType?: StringNullableWithAggregatesFilter<"InterviewSession"> | string | null
    jdContext?: StringNullableWithAggregatesFilter<"InterviewSession"> | string | null
    openaiSessionId?: StringNullableWithAggregatesFilter<"InterviewSession"> | string | null
    fallbackMode?: BoolWithAggregatesFilter<"InterviewSession"> | boolean
    startTime?: DateTimeNullableWithAggregatesFilter<"InterviewSession"> | Date | string | null
    endTime?: DateTimeNullableWithAggregatesFilter<"InterviewSession"> | Date | string | null
    duration?: IntNullableWithAggregatesFilter<"InterviewSession"> | number | null
    status?: StringWithAggregatesFilter<"InterviewSession"> | string
    feedbackStatus?: StringWithAggregatesFilter<"InterviewSession"> | string
    metadata?: JsonNullableWithAggregatesFilter<"InterviewSession">
    startedAt?: DateTimeWithAggregatesFilter<"InterviewSession"> | Date | string
    endedAt?: DateTimeNullableWithAggregatesFilter<"InterviewSession"> | Date | string | null
    durationSeconds?: IntNullableWithAggregatesFilter<"InterviewSession"> | number | null
    audioUrl?: StringNullableWithAggregatesFilter<"InterviewSession"> | string | null
    expiresAt?: DateTimeNullableWithAggregatesFilter<"InterviewSession"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"InterviewSession"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"InterviewSession"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"InterviewSession"> | Date | string | null
  }

  export type TranscriptWhereInput = {
    AND?: TranscriptWhereInput | TranscriptWhereInput[]
    OR?: TranscriptWhereInput[]
    NOT?: TranscriptWhereInput | TranscriptWhereInput[]
    id?: StringFilter<"Transcript"> | string
    sessionId?: StringFilter<"Transcript"> | string
    role?: StringFilter<"Transcript"> | string
    content?: StringFilter<"Transcript"> | string
    confidence?: FloatNullableFilter<"Transcript"> | number | null
    timestamp?: DateTimeFilter<"Transcript"> | Date | string
    sequenceNumber?: IntFilter<"Transcript"> | number
    metadata?: JsonNullableFilter<"Transcript">
    expiresAt?: DateTimeNullableFilter<"Transcript"> | Date | string | null
    createdAt?: DateTimeFilter<"Transcript"> | Date | string
    updatedAt?: DateTimeFilter<"Transcript"> | Date | string
    session?: XOR<InterviewSessionScalarRelationFilter, InterviewSessionWhereInput>
  }

  export type TranscriptOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    confidence?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    sequenceNumber?: SortOrder
    metadata?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    session?: InterviewSessionOrderByWithRelationInput
  }

  export type TranscriptWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TranscriptWhereInput | TranscriptWhereInput[]
    OR?: TranscriptWhereInput[]
    NOT?: TranscriptWhereInput | TranscriptWhereInput[]
    sessionId?: StringFilter<"Transcript"> | string
    role?: StringFilter<"Transcript"> | string
    content?: StringFilter<"Transcript"> | string
    confidence?: FloatNullableFilter<"Transcript"> | number | null
    timestamp?: DateTimeFilter<"Transcript"> | Date | string
    sequenceNumber?: IntFilter<"Transcript"> | number
    metadata?: JsonNullableFilter<"Transcript">
    expiresAt?: DateTimeNullableFilter<"Transcript"> | Date | string | null
    createdAt?: DateTimeFilter<"Transcript"> | Date | string
    updatedAt?: DateTimeFilter<"Transcript"> | Date | string
    session?: XOR<InterviewSessionScalarRelationFilter, InterviewSessionWhereInput>
  }, "id">

  export type TranscriptOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    confidence?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    sequenceNumber?: SortOrder
    metadata?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TranscriptCountOrderByAggregateInput
    _avg?: TranscriptAvgOrderByAggregateInput
    _max?: TranscriptMaxOrderByAggregateInput
    _min?: TranscriptMinOrderByAggregateInput
    _sum?: TranscriptSumOrderByAggregateInput
  }

  export type TranscriptScalarWhereWithAggregatesInput = {
    AND?: TranscriptScalarWhereWithAggregatesInput | TranscriptScalarWhereWithAggregatesInput[]
    OR?: TranscriptScalarWhereWithAggregatesInput[]
    NOT?: TranscriptScalarWhereWithAggregatesInput | TranscriptScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Transcript"> | string
    sessionId?: StringWithAggregatesFilter<"Transcript"> | string
    role?: StringWithAggregatesFilter<"Transcript"> | string
    content?: StringWithAggregatesFilter<"Transcript"> | string
    confidence?: FloatNullableWithAggregatesFilter<"Transcript"> | number | null
    timestamp?: DateTimeWithAggregatesFilter<"Transcript"> | Date | string
    sequenceNumber?: IntWithAggregatesFilter<"Transcript"> | number
    metadata?: JsonNullableWithAggregatesFilter<"Transcript">
    expiresAt?: DateTimeNullableWithAggregatesFilter<"Transcript"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Transcript"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Transcript"> | Date | string
  }

  export type FeedbackWhereInput = {
    AND?: FeedbackWhereInput | FeedbackWhereInput[]
    OR?: FeedbackWhereInput[]
    NOT?: FeedbackWhereInput | FeedbackWhereInput[]
    id?: StringFilter<"Feedback"> | string
    sessionId?: StringFilter<"Feedback"> | string
    userId?: StringFilter<"Feedback"> | string
    summary?: StringFilter<"Feedback"> | string
    strengths?: StringNullableFilter<"Feedback"> | string | null
    areasForImprovement?: StringNullableFilter<"Feedback"> | string | null
    fillerWordCount?: IntNullableFilter<"Feedback"> | number | null
    transcriptScore?: FloatNullableFilter<"Feedback"> | number | null
    structuredData?: JsonNullableFilter<"Feedback">
    clarityScore?: FloatNullableFilter<"Feedback"> | number | null
    concisenessScore?: FloatNullableFilter<"Feedback"> | number | null
    technicalDepthScore?: FloatNullableFilter<"Feedback"> | number | null
    starMethodScore?: FloatNullableFilter<"Feedback"> | number | null
    overallScore?: FloatNullableFilter<"Feedback"> | number | null
    enhancedFeedbackGenerated?: BoolFilter<"Feedback"> | boolean
    enhancedReportData?: JsonNullableFilter<"Feedback">
    toneAnalysis?: JsonNullableFilter<"Feedback">
    keywordRelevanceScore?: FloatNullableFilter<"Feedback"> | number | null
    sentimentProgression?: JsonNullableFilter<"Feedback">
    enhancedGeneratedAt?: DateTimeNullableFilter<"Feedback"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"Feedback"> | Date | string | null
    createdAt?: DateTimeFilter<"Feedback"> | Date | string
    updatedAt?: DateTimeFilter<"Feedback"> | Date | string
    session?: XOR<InterviewSessionScalarRelationFilter, InterviewSessionWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type FeedbackOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    summary?: SortOrder
    strengths?: SortOrderInput | SortOrder
    areasForImprovement?: SortOrderInput | SortOrder
    fillerWordCount?: SortOrderInput | SortOrder
    transcriptScore?: SortOrderInput | SortOrder
    structuredData?: SortOrderInput | SortOrder
    clarityScore?: SortOrderInput | SortOrder
    concisenessScore?: SortOrderInput | SortOrder
    technicalDepthScore?: SortOrderInput | SortOrder
    starMethodScore?: SortOrderInput | SortOrder
    overallScore?: SortOrderInput | SortOrder
    enhancedFeedbackGenerated?: SortOrder
    enhancedReportData?: SortOrderInput | SortOrder
    toneAnalysis?: SortOrderInput | SortOrder
    keywordRelevanceScore?: SortOrderInput | SortOrder
    sentimentProgression?: SortOrderInput | SortOrder
    enhancedGeneratedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    session?: InterviewSessionOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type FeedbackWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FeedbackWhereInput | FeedbackWhereInput[]
    OR?: FeedbackWhereInput[]
    NOT?: FeedbackWhereInput | FeedbackWhereInput[]
    sessionId?: StringFilter<"Feedback"> | string
    userId?: StringFilter<"Feedback"> | string
    summary?: StringFilter<"Feedback"> | string
    strengths?: StringNullableFilter<"Feedback"> | string | null
    areasForImprovement?: StringNullableFilter<"Feedback"> | string | null
    fillerWordCount?: IntNullableFilter<"Feedback"> | number | null
    transcriptScore?: FloatNullableFilter<"Feedback"> | number | null
    structuredData?: JsonNullableFilter<"Feedback">
    clarityScore?: FloatNullableFilter<"Feedback"> | number | null
    concisenessScore?: FloatNullableFilter<"Feedback"> | number | null
    technicalDepthScore?: FloatNullableFilter<"Feedback"> | number | null
    starMethodScore?: FloatNullableFilter<"Feedback"> | number | null
    overallScore?: FloatNullableFilter<"Feedback"> | number | null
    enhancedFeedbackGenerated?: BoolFilter<"Feedback"> | boolean
    enhancedReportData?: JsonNullableFilter<"Feedback">
    toneAnalysis?: JsonNullableFilter<"Feedback">
    keywordRelevanceScore?: FloatNullableFilter<"Feedback"> | number | null
    sentimentProgression?: JsonNullableFilter<"Feedback">
    enhancedGeneratedAt?: DateTimeNullableFilter<"Feedback"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"Feedback"> | Date | string | null
    createdAt?: DateTimeFilter<"Feedback"> | Date | string
    updatedAt?: DateTimeFilter<"Feedback"> | Date | string
    session?: XOR<InterviewSessionScalarRelationFilter, InterviewSessionWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type FeedbackOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    summary?: SortOrder
    strengths?: SortOrderInput | SortOrder
    areasForImprovement?: SortOrderInput | SortOrder
    fillerWordCount?: SortOrderInput | SortOrder
    transcriptScore?: SortOrderInput | SortOrder
    structuredData?: SortOrderInput | SortOrder
    clarityScore?: SortOrderInput | SortOrder
    concisenessScore?: SortOrderInput | SortOrder
    technicalDepthScore?: SortOrderInput | SortOrder
    starMethodScore?: SortOrderInput | SortOrder
    overallScore?: SortOrderInput | SortOrder
    enhancedFeedbackGenerated?: SortOrder
    enhancedReportData?: SortOrderInput | SortOrder
    toneAnalysis?: SortOrderInput | SortOrder
    keywordRelevanceScore?: SortOrderInput | SortOrder
    sentimentProgression?: SortOrderInput | SortOrder
    enhancedGeneratedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FeedbackCountOrderByAggregateInput
    _avg?: FeedbackAvgOrderByAggregateInput
    _max?: FeedbackMaxOrderByAggregateInput
    _min?: FeedbackMinOrderByAggregateInput
    _sum?: FeedbackSumOrderByAggregateInput
  }

  export type FeedbackScalarWhereWithAggregatesInput = {
    AND?: FeedbackScalarWhereWithAggregatesInput | FeedbackScalarWhereWithAggregatesInput[]
    OR?: FeedbackScalarWhereWithAggregatesInput[]
    NOT?: FeedbackScalarWhereWithAggregatesInput | FeedbackScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Feedback"> | string
    sessionId?: StringWithAggregatesFilter<"Feedback"> | string
    userId?: StringWithAggregatesFilter<"Feedback"> | string
    summary?: StringWithAggregatesFilter<"Feedback"> | string
    strengths?: StringNullableWithAggregatesFilter<"Feedback"> | string | null
    areasForImprovement?: StringNullableWithAggregatesFilter<"Feedback"> | string | null
    fillerWordCount?: IntNullableWithAggregatesFilter<"Feedback"> | number | null
    transcriptScore?: FloatNullableWithAggregatesFilter<"Feedback"> | number | null
    structuredData?: JsonNullableWithAggregatesFilter<"Feedback">
    clarityScore?: FloatNullableWithAggregatesFilter<"Feedback"> | number | null
    concisenessScore?: FloatNullableWithAggregatesFilter<"Feedback"> | number | null
    technicalDepthScore?: FloatNullableWithAggregatesFilter<"Feedback"> | number | null
    starMethodScore?: FloatNullableWithAggregatesFilter<"Feedback"> | number | null
    overallScore?: FloatNullableWithAggregatesFilter<"Feedback"> | number | null
    enhancedFeedbackGenerated?: BoolWithAggregatesFilter<"Feedback"> | boolean
    enhancedReportData?: JsonNullableWithAggregatesFilter<"Feedback">
    toneAnalysis?: JsonNullableWithAggregatesFilter<"Feedback">
    keywordRelevanceScore?: FloatNullableWithAggregatesFilter<"Feedback"> | number | null
    sentimentProgression?: JsonNullableWithAggregatesFilter<"Feedback">
    enhancedGeneratedAt?: DateTimeNullableWithAggregatesFilter<"Feedback"> | Date | string | null
    expiresAt?: DateTimeNullableWithAggregatesFilter<"Feedback"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Feedback"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Feedback"> | Date | string
  }

  export type UsageEventWhereInput = {
    AND?: UsageEventWhereInput | UsageEventWhereInput[]
    OR?: UsageEventWhereInput[]
    NOT?: UsageEventWhereInput | UsageEventWhereInput[]
    id?: StringFilter<"UsageEvent"> | string
    userId?: StringNullableFilter<"UsageEvent"> | string | null
    eventType?: StringFilter<"UsageEvent"> | string
    details?: JsonNullableFilter<"UsageEvent">
    occurredAt?: DateTimeFilter<"UsageEvent"> | Date | string
    createdAt?: DateTimeFilter<"UsageEvent"> | Date | string
    updatedAt?: DateTimeFilter<"UsageEvent"> | Date | string
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type UsageEventOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    eventType?: SortOrder
    details?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UsageEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UsageEventWhereInput | UsageEventWhereInput[]
    OR?: UsageEventWhereInput[]
    NOT?: UsageEventWhereInput | UsageEventWhereInput[]
    userId?: StringNullableFilter<"UsageEvent"> | string | null
    eventType?: StringFilter<"UsageEvent"> | string
    details?: JsonNullableFilter<"UsageEvent">
    occurredAt?: DateTimeFilter<"UsageEvent"> | Date | string
    createdAt?: DateTimeFilter<"UsageEvent"> | Date | string
    updatedAt?: DateTimeFilter<"UsageEvent"> | Date | string
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id">

  export type UsageEventOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    eventType?: SortOrder
    details?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UsageEventCountOrderByAggregateInput
    _max?: UsageEventMaxOrderByAggregateInput
    _min?: UsageEventMinOrderByAggregateInput
  }

  export type UsageEventScalarWhereWithAggregatesInput = {
    AND?: UsageEventScalarWhereWithAggregatesInput | UsageEventScalarWhereWithAggregatesInput[]
    OR?: UsageEventScalarWhereWithAggregatesInput[]
    NOT?: UsageEventScalarWhereWithAggregatesInput | UsageEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UsageEvent"> | string
    userId?: StringNullableWithAggregatesFilter<"UsageEvent"> | string | null
    eventType?: StringWithAggregatesFilter<"UsageEvent"> | string
    details?: JsonNullableWithAggregatesFilter<"UsageEvent">
    occurredAt?: DateTimeWithAggregatesFilter<"UsageEvent"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"UsageEvent"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UsageEvent"> | Date | string
  }

  export type UserCreateInput = {
    id: string
    clerkId: string
    role?: $Enums.UserRole
    credits?: Decimal | DecimalJsLike | number | string
    resumeJobTitle?: string | null
    resumeSkills?: string | null
    resumeExperience?: string | null
    resumeEducation?: string | null
    resumeAchievements?: string | null
    resumeFileUrl?: string | null
    jobSearchStage?: string | null
    linkedinUrl?: string | null
    acceptedTermsAt?: Date | string | null
    acceptedPrivacyAt?: Date | string | null
    dataRetentionOverride?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
    premiumExpiresAt?: Date | string | null
    premiumSubscriptionId?: string | null
    stripeCustomerId?: string | null
    isPremium?: boolean
    email?: string | null
    image?: string | null
    name?: string | null
    feedbacks?: FeedbackCreateNestedManyWithoutUserInput
    interviewSessions?: InterviewSessionCreateNestedManyWithoutUserInput
    usageEvents?: UsageEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id: string
    clerkId: string
    role?: $Enums.UserRole
    credits?: Decimal | DecimalJsLike | number | string
    resumeJobTitle?: string | null
    resumeSkills?: string | null
    resumeExperience?: string | null
    resumeEducation?: string | null
    resumeAchievements?: string | null
    resumeFileUrl?: string | null
    jobSearchStage?: string | null
    linkedinUrl?: string | null
    acceptedTermsAt?: Date | string | null
    acceptedPrivacyAt?: Date | string | null
    dataRetentionOverride?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
    premiumExpiresAt?: Date | string | null
    premiumSubscriptionId?: string | null
    stripeCustomerId?: string | null
    isPremium?: boolean
    email?: string | null
    image?: string | null
    name?: string | null
    feedbacks?: FeedbackUncheckedCreateNestedManyWithoutUserInput
    interviewSessions?: InterviewSessionUncheckedCreateNestedManyWithoutUserInput
    usageEvents?: UsageEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    credits?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    resumeSkills?: NullableStringFieldUpdateOperationsInput | string | null
    resumeExperience?: NullableStringFieldUpdateOperationsInput | string | null
    resumeEducation?: NullableStringFieldUpdateOperationsInput | string | null
    resumeAchievements?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    jobSearchStage?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedTermsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedPrivacyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dataRetentionOverride?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    premiumExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    premiumSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    email?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    feedbacks?: FeedbackUpdateManyWithoutUserNestedInput
    interviewSessions?: InterviewSessionUpdateManyWithoutUserNestedInput
    usageEvents?: UsageEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    credits?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    resumeSkills?: NullableStringFieldUpdateOperationsInput | string | null
    resumeExperience?: NullableStringFieldUpdateOperationsInput | string | null
    resumeEducation?: NullableStringFieldUpdateOperationsInput | string | null
    resumeAchievements?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    jobSearchStage?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedTermsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedPrivacyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dataRetentionOverride?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    premiumExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    premiumSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    email?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    feedbacks?: FeedbackUncheckedUpdateManyWithoutUserNestedInput
    interviewSessions?: InterviewSessionUncheckedUpdateManyWithoutUserNestedInput
    usageEvents?: UsageEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id: string
    clerkId: string
    role?: $Enums.UserRole
    credits?: Decimal | DecimalJsLike | number | string
    resumeJobTitle?: string | null
    resumeSkills?: string | null
    resumeExperience?: string | null
    resumeEducation?: string | null
    resumeAchievements?: string | null
    resumeFileUrl?: string | null
    jobSearchStage?: string | null
    linkedinUrl?: string | null
    acceptedTermsAt?: Date | string | null
    acceptedPrivacyAt?: Date | string | null
    dataRetentionOverride?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
    premiumExpiresAt?: Date | string | null
    premiumSubscriptionId?: string | null
    stripeCustomerId?: string | null
    isPremium?: boolean
    email?: string | null
    image?: string | null
    name?: string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    credits?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    resumeSkills?: NullableStringFieldUpdateOperationsInput | string | null
    resumeExperience?: NullableStringFieldUpdateOperationsInput | string | null
    resumeEducation?: NullableStringFieldUpdateOperationsInput | string | null
    resumeAchievements?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    jobSearchStage?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedTermsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedPrivacyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dataRetentionOverride?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    premiumExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    premiumSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    email?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    credits?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    resumeSkills?: NullableStringFieldUpdateOperationsInput | string | null
    resumeExperience?: NullableStringFieldUpdateOperationsInput | string | null
    resumeEducation?: NullableStringFieldUpdateOperationsInput | string | null
    resumeAchievements?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    jobSearchStage?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedTermsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedPrivacyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dataRetentionOverride?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    premiumExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    premiumSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    email?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type InterviewSessionCreateInput = {
    id?: string
    jobTitle: string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: string | null
    interviewType?: string | null
    jdContext?: string | null
    openaiSessionId?: string | null
    fallbackMode?: boolean
    startTime?: Date | string | null
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    feedbackStatus?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    endedAt?: Date | string | null
    durationSeconds?: number | null
    audioUrl?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    feedbacks?: FeedbackCreateNestedManyWithoutSessionInput
    user: UserCreateNestedOneWithoutInterviewSessionsInput
    transcripts?: TranscriptCreateNestedManyWithoutSessionInput
  }

  export type InterviewSessionUncheckedCreateInput = {
    id?: string
    userId: string
    jobTitle: string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: string | null
    interviewType?: string | null
    jdContext?: string | null
    openaiSessionId?: string | null
    fallbackMode?: boolean
    startTime?: Date | string | null
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    feedbackStatus?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    endedAt?: Date | string | null
    durationSeconds?: number | null
    audioUrl?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    feedbacks?: FeedbackUncheckedCreateNestedManyWithoutSessionInput
    transcripts?: TranscriptUncheckedCreateNestedManyWithoutSessionInput
  }

  export type InterviewSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: NullableStringFieldUpdateOperationsInput | string | null
    interviewType?: NullableStringFieldUpdateOperationsInput | string | null
    jdContext?: NullableStringFieldUpdateOperationsInput | string | null
    openaiSessionId?: NullableStringFieldUpdateOperationsInput | string | null
    fallbackMode?: BoolFieldUpdateOperationsInput | boolean
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    feedbackStatus?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    feedbacks?: FeedbackUpdateManyWithoutSessionNestedInput
    user?: UserUpdateOneRequiredWithoutInterviewSessionsNestedInput
    transcripts?: TranscriptUpdateManyWithoutSessionNestedInput
  }

  export type InterviewSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: NullableStringFieldUpdateOperationsInput | string | null
    interviewType?: NullableStringFieldUpdateOperationsInput | string | null
    jdContext?: NullableStringFieldUpdateOperationsInput | string | null
    openaiSessionId?: NullableStringFieldUpdateOperationsInput | string | null
    fallbackMode?: BoolFieldUpdateOperationsInput | boolean
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    feedbackStatus?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    feedbacks?: FeedbackUncheckedUpdateManyWithoutSessionNestedInput
    transcripts?: TranscriptUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type InterviewSessionCreateManyInput = {
    id?: string
    userId: string
    jobTitle: string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: string | null
    interviewType?: string | null
    jdContext?: string | null
    openaiSessionId?: string | null
    fallbackMode?: boolean
    startTime?: Date | string | null
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    feedbackStatus?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    endedAt?: Date | string | null
    durationSeconds?: number | null
    audioUrl?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type InterviewSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: NullableStringFieldUpdateOperationsInput | string | null
    interviewType?: NullableStringFieldUpdateOperationsInput | string | null
    jdContext?: NullableStringFieldUpdateOperationsInput | string | null
    openaiSessionId?: NullableStringFieldUpdateOperationsInput | string | null
    fallbackMode?: BoolFieldUpdateOperationsInput | boolean
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    feedbackStatus?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type InterviewSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: NullableStringFieldUpdateOperationsInput | string | null
    interviewType?: NullableStringFieldUpdateOperationsInput | string | null
    jdContext?: NullableStringFieldUpdateOperationsInput | string | null
    openaiSessionId?: NullableStringFieldUpdateOperationsInput | string | null
    fallbackMode?: BoolFieldUpdateOperationsInput | boolean
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    feedbackStatus?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TranscriptCreateInput = {
    id?: string
    role: string
    content: string
    confidence?: number | null
    timestamp: Date | string
    sequenceNumber?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    session: InterviewSessionCreateNestedOneWithoutTranscriptsInput
  }

  export type TranscriptUncheckedCreateInput = {
    id?: string
    sessionId: string
    role: string
    content: string
    confidence?: number | null
    timestamp: Date | string
    sequenceNumber?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TranscriptUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    sequenceNumber?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: InterviewSessionUpdateOneRequiredWithoutTranscriptsNestedInput
  }

  export type TranscriptUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    sequenceNumber?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TranscriptCreateManyInput = {
    id?: string
    sessionId: string
    role: string
    content: string
    confidence?: number | null
    timestamp: Date | string
    sequenceNumber?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TranscriptUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    sequenceNumber?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TranscriptUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    sequenceNumber?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeedbackCreateInput = {
    id?: string
    summary: string
    strengths?: string | null
    areasForImprovement?: string | null
    fillerWordCount?: number | null
    transcriptScore?: number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: number | null
    concisenessScore?: number | null
    technicalDepthScore?: number | null
    starMethodScore?: number | null
    overallScore?: number | null
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    session: InterviewSessionCreateNestedOneWithoutFeedbacksInput
    user: UserCreateNestedOneWithoutFeedbacksInput
  }

  export type FeedbackUncheckedCreateInput = {
    id?: string
    sessionId: string
    userId: string
    summary: string
    strengths?: string | null
    areasForImprovement?: string | null
    fillerWordCount?: number | null
    transcriptScore?: number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: number | null
    concisenessScore?: number | null
    technicalDepthScore?: number | null
    starMethodScore?: number | null
    overallScore?: number | null
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FeedbackUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    strengths?: NullableStringFieldUpdateOperationsInput | string | null
    areasForImprovement?: NullableStringFieldUpdateOperationsInput | string | null
    fillerWordCount?: NullableIntFieldUpdateOperationsInput | number | null
    transcriptScore?: NullableFloatFieldUpdateOperationsInput | number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    concisenessScore?: NullableFloatFieldUpdateOperationsInput | number | null
    technicalDepthScore?: NullableFloatFieldUpdateOperationsInput | number | null
    starMethodScore?: NullableFloatFieldUpdateOperationsInput | number | null
    overallScore?: NullableFloatFieldUpdateOperationsInput | number | null
    enhancedFeedbackGenerated?: BoolFieldUpdateOperationsInput | boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: InterviewSessionUpdateOneRequiredWithoutFeedbacksNestedInput
    user?: UserUpdateOneRequiredWithoutFeedbacksNestedInput
  }

  export type FeedbackUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    strengths?: NullableStringFieldUpdateOperationsInput | string | null
    areasForImprovement?: NullableStringFieldUpdateOperationsInput | string | null
    fillerWordCount?: NullableIntFieldUpdateOperationsInput | number | null
    transcriptScore?: NullableFloatFieldUpdateOperationsInput | number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    concisenessScore?: NullableFloatFieldUpdateOperationsInput | number | null
    technicalDepthScore?: NullableFloatFieldUpdateOperationsInput | number | null
    starMethodScore?: NullableFloatFieldUpdateOperationsInput | number | null
    overallScore?: NullableFloatFieldUpdateOperationsInput | number | null
    enhancedFeedbackGenerated?: BoolFieldUpdateOperationsInput | boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeedbackCreateManyInput = {
    id?: string
    sessionId: string
    userId: string
    summary: string
    strengths?: string | null
    areasForImprovement?: string | null
    fillerWordCount?: number | null
    transcriptScore?: number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: number | null
    concisenessScore?: number | null
    technicalDepthScore?: number | null
    starMethodScore?: number | null
    overallScore?: number | null
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FeedbackUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    strengths?: NullableStringFieldUpdateOperationsInput | string | null
    areasForImprovement?: NullableStringFieldUpdateOperationsInput | string | null
    fillerWordCount?: NullableIntFieldUpdateOperationsInput | number | null
    transcriptScore?: NullableFloatFieldUpdateOperationsInput | number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    concisenessScore?: NullableFloatFieldUpdateOperationsInput | number | null
    technicalDepthScore?: NullableFloatFieldUpdateOperationsInput | number | null
    starMethodScore?: NullableFloatFieldUpdateOperationsInput | number | null
    overallScore?: NullableFloatFieldUpdateOperationsInput | number | null
    enhancedFeedbackGenerated?: BoolFieldUpdateOperationsInput | boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeedbackUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    strengths?: NullableStringFieldUpdateOperationsInput | string | null
    areasForImprovement?: NullableStringFieldUpdateOperationsInput | string | null
    fillerWordCount?: NullableIntFieldUpdateOperationsInput | number | null
    transcriptScore?: NullableFloatFieldUpdateOperationsInput | number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    concisenessScore?: NullableFloatFieldUpdateOperationsInput | number | null
    technicalDepthScore?: NullableFloatFieldUpdateOperationsInput | number | null
    starMethodScore?: NullableFloatFieldUpdateOperationsInput | number | null
    overallScore?: NullableFloatFieldUpdateOperationsInput | number | null
    enhancedFeedbackGenerated?: BoolFieldUpdateOperationsInput | boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsageEventCreateInput = {
    id: string
    eventType: string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    user?: UserCreateNestedOneWithoutUsageEventsInput
  }

  export type UsageEventUncheckedCreateInput = {
    id: string
    userId?: string | null
    eventType: string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UsageEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutUsageEventsNestedInput
  }

  export type UsageEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    eventType?: StringFieldUpdateOperationsInput | string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsageEventCreateManyInput = {
    id: string
    userId?: string | null
    eventType: string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UsageEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsageEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    eventType?: StringFieldUpdateOperationsInput | string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type FeedbackListRelationFilter = {
    every?: FeedbackWhereInput
    some?: FeedbackWhereInput
    none?: FeedbackWhereInput
  }

  export type InterviewSessionListRelationFilter = {
    every?: InterviewSessionWhereInput
    some?: InterviewSessionWhereInput
    none?: InterviewSessionWhereInput
  }

  export type UsageEventListRelationFilter = {
    every?: UsageEventWhereInput
    some?: UsageEventWhereInput
    none?: UsageEventWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type FeedbackOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InterviewSessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UsageEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    clerkId?: SortOrder
    role?: SortOrder
    credits?: SortOrder
    resumeJobTitle?: SortOrder
    resumeSkills?: SortOrder
    resumeExperience?: SortOrder
    resumeEducation?: SortOrder
    resumeAchievements?: SortOrder
    resumeFileUrl?: SortOrder
    jobSearchStage?: SortOrder
    linkedinUrl?: SortOrder
    acceptedTermsAt?: SortOrder
    acceptedPrivacyAt?: SortOrder
    dataRetentionOverride?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    premiumExpiresAt?: SortOrder
    premiumSubscriptionId?: SortOrder
    stripeCustomerId?: SortOrder
    isPremium?: SortOrder
    email?: SortOrder
    image?: SortOrder
    name?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    credits?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    clerkId?: SortOrder
    role?: SortOrder
    credits?: SortOrder
    resumeJobTitle?: SortOrder
    resumeSkills?: SortOrder
    resumeExperience?: SortOrder
    resumeEducation?: SortOrder
    resumeAchievements?: SortOrder
    resumeFileUrl?: SortOrder
    jobSearchStage?: SortOrder
    linkedinUrl?: SortOrder
    acceptedTermsAt?: SortOrder
    acceptedPrivacyAt?: SortOrder
    dataRetentionOverride?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    premiumExpiresAt?: SortOrder
    premiumSubscriptionId?: SortOrder
    stripeCustomerId?: SortOrder
    isPremium?: SortOrder
    email?: SortOrder
    image?: SortOrder
    name?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    clerkId?: SortOrder
    role?: SortOrder
    credits?: SortOrder
    resumeJobTitle?: SortOrder
    resumeSkills?: SortOrder
    resumeExperience?: SortOrder
    resumeEducation?: SortOrder
    resumeAchievements?: SortOrder
    resumeFileUrl?: SortOrder
    jobSearchStage?: SortOrder
    linkedinUrl?: SortOrder
    acceptedTermsAt?: SortOrder
    acceptedPrivacyAt?: SortOrder
    dataRetentionOverride?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    premiumExpiresAt?: SortOrder
    premiumSubscriptionId?: SortOrder
    stripeCustomerId?: SortOrder
    isPremium?: SortOrder
    email?: SortOrder
    image?: SortOrder
    name?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    credits?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type TranscriptListRelationFilter = {
    every?: TranscriptWhereInput
    some?: TranscriptWhereInput
    none?: TranscriptWhereInput
  }

  export type TranscriptOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InterviewSessionCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    jobTitle?: SortOrder
    resumeData?: SortOrder
    resumeSnapshot?: SortOrder
    company?: SortOrder
    interviewType?: SortOrder
    jdContext?: SortOrder
    openaiSessionId?: SortOrder
    fallbackMode?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    duration?: SortOrder
    status?: SortOrder
    feedbackStatus?: SortOrder
    metadata?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    durationSeconds?: SortOrder
    audioUrl?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type InterviewSessionAvgOrderByAggregateInput = {
    duration?: SortOrder
    durationSeconds?: SortOrder
  }

  export type InterviewSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    jobTitle?: SortOrder
    company?: SortOrder
    interviewType?: SortOrder
    jdContext?: SortOrder
    openaiSessionId?: SortOrder
    fallbackMode?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    duration?: SortOrder
    status?: SortOrder
    feedbackStatus?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    durationSeconds?: SortOrder
    audioUrl?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type InterviewSessionMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    jobTitle?: SortOrder
    company?: SortOrder
    interviewType?: SortOrder
    jdContext?: SortOrder
    openaiSessionId?: SortOrder
    fallbackMode?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    duration?: SortOrder
    status?: SortOrder
    feedbackStatus?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    durationSeconds?: SortOrder
    audioUrl?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type InterviewSessionSumOrderByAggregateInput = {
    duration?: SortOrder
    durationSeconds?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type InterviewSessionScalarRelationFilter = {
    is?: InterviewSessionWhereInput
    isNot?: InterviewSessionWhereInput
  }

  export type TranscriptCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    confidence?: SortOrder
    timestamp?: SortOrder
    sequenceNumber?: SortOrder
    metadata?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TranscriptAvgOrderByAggregateInput = {
    confidence?: SortOrder
    sequenceNumber?: SortOrder
  }

  export type TranscriptMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    confidence?: SortOrder
    timestamp?: SortOrder
    sequenceNumber?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TranscriptMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    confidence?: SortOrder
    timestamp?: SortOrder
    sequenceNumber?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TranscriptSumOrderByAggregateInput = {
    confidence?: SortOrder
    sequenceNumber?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FeedbackCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    summary?: SortOrder
    strengths?: SortOrder
    areasForImprovement?: SortOrder
    fillerWordCount?: SortOrder
    transcriptScore?: SortOrder
    structuredData?: SortOrder
    clarityScore?: SortOrder
    concisenessScore?: SortOrder
    technicalDepthScore?: SortOrder
    starMethodScore?: SortOrder
    overallScore?: SortOrder
    enhancedFeedbackGenerated?: SortOrder
    enhancedReportData?: SortOrder
    toneAnalysis?: SortOrder
    keywordRelevanceScore?: SortOrder
    sentimentProgression?: SortOrder
    enhancedGeneratedAt?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FeedbackAvgOrderByAggregateInput = {
    fillerWordCount?: SortOrder
    transcriptScore?: SortOrder
    clarityScore?: SortOrder
    concisenessScore?: SortOrder
    technicalDepthScore?: SortOrder
    starMethodScore?: SortOrder
    overallScore?: SortOrder
    keywordRelevanceScore?: SortOrder
  }

  export type FeedbackMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    summary?: SortOrder
    strengths?: SortOrder
    areasForImprovement?: SortOrder
    fillerWordCount?: SortOrder
    transcriptScore?: SortOrder
    clarityScore?: SortOrder
    concisenessScore?: SortOrder
    technicalDepthScore?: SortOrder
    starMethodScore?: SortOrder
    overallScore?: SortOrder
    enhancedFeedbackGenerated?: SortOrder
    keywordRelevanceScore?: SortOrder
    enhancedGeneratedAt?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FeedbackMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    summary?: SortOrder
    strengths?: SortOrder
    areasForImprovement?: SortOrder
    fillerWordCount?: SortOrder
    transcriptScore?: SortOrder
    clarityScore?: SortOrder
    concisenessScore?: SortOrder
    technicalDepthScore?: SortOrder
    starMethodScore?: SortOrder
    overallScore?: SortOrder
    enhancedFeedbackGenerated?: SortOrder
    keywordRelevanceScore?: SortOrder
    enhancedGeneratedAt?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FeedbackSumOrderByAggregateInput = {
    fillerWordCount?: SortOrder
    transcriptScore?: SortOrder
    clarityScore?: SortOrder
    concisenessScore?: SortOrder
    technicalDepthScore?: SortOrder
    starMethodScore?: SortOrder
    overallScore?: SortOrder
    keywordRelevanceScore?: SortOrder
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type UsageEventCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    eventType?: SortOrder
    details?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UsageEventMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    eventType?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UsageEventMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    eventType?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FeedbackCreateNestedManyWithoutUserInput = {
    create?: XOR<FeedbackCreateWithoutUserInput, FeedbackUncheckedCreateWithoutUserInput> | FeedbackCreateWithoutUserInput[] | FeedbackUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FeedbackCreateOrConnectWithoutUserInput | FeedbackCreateOrConnectWithoutUserInput[]
    createMany?: FeedbackCreateManyUserInputEnvelope
    connect?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
  }

  export type InterviewSessionCreateNestedManyWithoutUserInput = {
    create?: XOR<InterviewSessionCreateWithoutUserInput, InterviewSessionUncheckedCreateWithoutUserInput> | InterviewSessionCreateWithoutUserInput[] | InterviewSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: InterviewSessionCreateOrConnectWithoutUserInput | InterviewSessionCreateOrConnectWithoutUserInput[]
    createMany?: InterviewSessionCreateManyUserInputEnvelope
    connect?: InterviewSessionWhereUniqueInput | InterviewSessionWhereUniqueInput[]
  }

  export type UsageEventCreateNestedManyWithoutUserInput = {
    create?: XOR<UsageEventCreateWithoutUserInput, UsageEventUncheckedCreateWithoutUserInput> | UsageEventCreateWithoutUserInput[] | UsageEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UsageEventCreateOrConnectWithoutUserInput | UsageEventCreateOrConnectWithoutUserInput[]
    createMany?: UsageEventCreateManyUserInputEnvelope
    connect?: UsageEventWhereUniqueInput | UsageEventWhereUniqueInput[]
  }

  export type FeedbackUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<FeedbackCreateWithoutUserInput, FeedbackUncheckedCreateWithoutUserInput> | FeedbackCreateWithoutUserInput[] | FeedbackUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FeedbackCreateOrConnectWithoutUserInput | FeedbackCreateOrConnectWithoutUserInput[]
    createMany?: FeedbackCreateManyUserInputEnvelope
    connect?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
  }

  export type InterviewSessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<InterviewSessionCreateWithoutUserInput, InterviewSessionUncheckedCreateWithoutUserInput> | InterviewSessionCreateWithoutUserInput[] | InterviewSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: InterviewSessionCreateOrConnectWithoutUserInput | InterviewSessionCreateOrConnectWithoutUserInput[]
    createMany?: InterviewSessionCreateManyUserInputEnvelope
    connect?: InterviewSessionWhereUniqueInput | InterviewSessionWhereUniqueInput[]
  }

  export type UsageEventUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UsageEventCreateWithoutUserInput, UsageEventUncheckedCreateWithoutUserInput> | UsageEventCreateWithoutUserInput[] | UsageEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UsageEventCreateOrConnectWithoutUserInput | UsageEventCreateOrConnectWithoutUserInput[]
    createMany?: UsageEventCreateManyUserInputEnvelope
    connect?: UsageEventWhereUniqueInput | UsageEventWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type FeedbackUpdateManyWithoutUserNestedInput = {
    create?: XOR<FeedbackCreateWithoutUserInput, FeedbackUncheckedCreateWithoutUserInput> | FeedbackCreateWithoutUserInput[] | FeedbackUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FeedbackCreateOrConnectWithoutUserInput | FeedbackCreateOrConnectWithoutUserInput[]
    upsert?: FeedbackUpsertWithWhereUniqueWithoutUserInput | FeedbackUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: FeedbackCreateManyUserInputEnvelope
    set?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    disconnect?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    delete?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    connect?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    update?: FeedbackUpdateWithWhereUniqueWithoutUserInput | FeedbackUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: FeedbackUpdateManyWithWhereWithoutUserInput | FeedbackUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: FeedbackScalarWhereInput | FeedbackScalarWhereInput[]
  }

  export type InterviewSessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<InterviewSessionCreateWithoutUserInput, InterviewSessionUncheckedCreateWithoutUserInput> | InterviewSessionCreateWithoutUserInput[] | InterviewSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: InterviewSessionCreateOrConnectWithoutUserInput | InterviewSessionCreateOrConnectWithoutUserInput[]
    upsert?: InterviewSessionUpsertWithWhereUniqueWithoutUserInput | InterviewSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: InterviewSessionCreateManyUserInputEnvelope
    set?: InterviewSessionWhereUniqueInput | InterviewSessionWhereUniqueInput[]
    disconnect?: InterviewSessionWhereUniqueInput | InterviewSessionWhereUniqueInput[]
    delete?: InterviewSessionWhereUniqueInput | InterviewSessionWhereUniqueInput[]
    connect?: InterviewSessionWhereUniqueInput | InterviewSessionWhereUniqueInput[]
    update?: InterviewSessionUpdateWithWhereUniqueWithoutUserInput | InterviewSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: InterviewSessionUpdateManyWithWhereWithoutUserInput | InterviewSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: InterviewSessionScalarWhereInput | InterviewSessionScalarWhereInput[]
  }

  export type UsageEventUpdateManyWithoutUserNestedInput = {
    create?: XOR<UsageEventCreateWithoutUserInput, UsageEventUncheckedCreateWithoutUserInput> | UsageEventCreateWithoutUserInput[] | UsageEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UsageEventCreateOrConnectWithoutUserInput | UsageEventCreateOrConnectWithoutUserInput[]
    upsert?: UsageEventUpsertWithWhereUniqueWithoutUserInput | UsageEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UsageEventCreateManyUserInputEnvelope
    set?: UsageEventWhereUniqueInput | UsageEventWhereUniqueInput[]
    disconnect?: UsageEventWhereUniqueInput | UsageEventWhereUniqueInput[]
    delete?: UsageEventWhereUniqueInput | UsageEventWhereUniqueInput[]
    connect?: UsageEventWhereUniqueInput | UsageEventWhereUniqueInput[]
    update?: UsageEventUpdateWithWhereUniqueWithoutUserInput | UsageEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UsageEventUpdateManyWithWhereWithoutUserInput | UsageEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UsageEventScalarWhereInput | UsageEventScalarWhereInput[]
  }

  export type FeedbackUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<FeedbackCreateWithoutUserInput, FeedbackUncheckedCreateWithoutUserInput> | FeedbackCreateWithoutUserInput[] | FeedbackUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FeedbackCreateOrConnectWithoutUserInput | FeedbackCreateOrConnectWithoutUserInput[]
    upsert?: FeedbackUpsertWithWhereUniqueWithoutUserInput | FeedbackUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: FeedbackCreateManyUserInputEnvelope
    set?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    disconnect?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    delete?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    connect?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    update?: FeedbackUpdateWithWhereUniqueWithoutUserInput | FeedbackUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: FeedbackUpdateManyWithWhereWithoutUserInput | FeedbackUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: FeedbackScalarWhereInput | FeedbackScalarWhereInput[]
  }

  export type InterviewSessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<InterviewSessionCreateWithoutUserInput, InterviewSessionUncheckedCreateWithoutUserInput> | InterviewSessionCreateWithoutUserInput[] | InterviewSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: InterviewSessionCreateOrConnectWithoutUserInput | InterviewSessionCreateOrConnectWithoutUserInput[]
    upsert?: InterviewSessionUpsertWithWhereUniqueWithoutUserInput | InterviewSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: InterviewSessionCreateManyUserInputEnvelope
    set?: InterviewSessionWhereUniqueInput | InterviewSessionWhereUniqueInput[]
    disconnect?: InterviewSessionWhereUniqueInput | InterviewSessionWhereUniqueInput[]
    delete?: InterviewSessionWhereUniqueInput | InterviewSessionWhereUniqueInput[]
    connect?: InterviewSessionWhereUniqueInput | InterviewSessionWhereUniqueInput[]
    update?: InterviewSessionUpdateWithWhereUniqueWithoutUserInput | InterviewSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: InterviewSessionUpdateManyWithWhereWithoutUserInput | InterviewSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: InterviewSessionScalarWhereInput | InterviewSessionScalarWhereInput[]
  }

  export type UsageEventUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UsageEventCreateWithoutUserInput, UsageEventUncheckedCreateWithoutUserInput> | UsageEventCreateWithoutUserInput[] | UsageEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UsageEventCreateOrConnectWithoutUserInput | UsageEventCreateOrConnectWithoutUserInput[]
    upsert?: UsageEventUpsertWithWhereUniqueWithoutUserInput | UsageEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UsageEventCreateManyUserInputEnvelope
    set?: UsageEventWhereUniqueInput | UsageEventWhereUniqueInput[]
    disconnect?: UsageEventWhereUniqueInput | UsageEventWhereUniqueInput[]
    delete?: UsageEventWhereUniqueInput | UsageEventWhereUniqueInput[]
    connect?: UsageEventWhereUniqueInput | UsageEventWhereUniqueInput[]
    update?: UsageEventUpdateWithWhereUniqueWithoutUserInput | UsageEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UsageEventUpdateManyWithWhereWithoutUserInput | UsageEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UsageEventScalarWhereInput | UsageEventScalarWhereInput[]
  }

  export type FeedbackCreateNestedManyWithoutSessionInput = {
    create?: XOR<FeedbackCreateWithoutSessionInput, FeedbackUncheckedCreateWithoutSessionInput> | FeedbackCreateWithoutSessionInput[] | FeedbackUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: FeedbackCreateOrConnectWithoutSessionInput | FeedbackCreateOrConnectWithoutSessionInput[]
    createMany?: FeedbackCreateManySessionInputEnvelope
    connect?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutInterviewSessionsInput = {
    create?: XOR<UserCreateWithoutInterviewSessionsInput, UserUncheckedCreateWithoutInterviewSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutInterviewSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type TranscriptCreateNestedManyWithoutSessionInput = {
    create?: XOR<TranscriptCreateWithoutSessionInput, TranscriptUncheckedCreateWithoutSessionInput> | TranscriptCreateWithoutSessionInput[] | TranscriptUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: TranscriptCreateOrConnectWithoutSessionInput | TranscriptCreateOrConnectWithoutSessionInput[]
    createMany?: TranscriptCreateManySessionInputEnvelope
    connect?: TranscriptWhereUniqueInput | TranscriptWhereUniqueInput[]
  }

  export type FeedbackUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<FeedbackCreateWithoutSessionInput, FeedbackUncheckedCreateWithoutSessionInput> | FeedbackCreateWithoutSessionInput[] | FeedbackUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: FeedbackCreateOrConnectWithoutSessionInput | FeedbackCreateOrConnectWithoutSessionInput[]
    createMany?: FeedbackCreateManySessionInputEnvelope
    connect?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
  }

  export type TranscriptUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<TranscriptCreateWithoutSessionInput, TranscriptUncheckedCreateWithoutSessionInput> | TranscriptCreateWithoutSessionInput[] | TranscriptUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: TranscriptCreateOrConnectWithoutSessionInput | TranscriptCreateOrConnectWithoutSessionInput[]
    createMany?: TranscriptCreateManySessionInputEnvelope
    connect?: TranscriptWhereUniqueInput | TranscriptWhereUniqueInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FeedbackUpdateManyWithoutSessionNestedInput = {
    create?: XOR<FeedbackCreateWithoutSessionInput, FeedbackUncheckedCreateWithoutSessionInput> | FeedbackCreateWithoutSessionInput[] | FeedbackUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: FeedbackCreateOrConnectWithoutSessionInput | FeedbackCreateOrConnectWithoutSessionInput[]
    upsert?: FeedbackUpsertWithWhereUniqueWithoutSessionInput | FeedbackUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: FeedbackCreateManySessionInputEnvelope
    set?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    disconnect?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    delete?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    connect?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    update?: FeedbackUpdateWithWhereUniqueWithoutSessionInput | FeedbackUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: FeedbackUpdateManyWithWhereWithoutSessionInput | FeedbackUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: FeedbackScalarWhereInput | FeedbackScalarWhereInput[]
  }

  export type UserUpdateOneRequiredWithoutInterviewSessionsNestedInput = {
    create?: XOR<UserCreateWithoutInterviewSessionsInput, UserUncheckedCreateWithoutInterviewSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutInterviewSessionsInput
    upsert?: UserUpsertWithoutInterviewSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutInterviewSessionsInput, UserUpdateWithoutInterviewSessionsInput>, UserUncheckedUpdateWithoutInterviewSessionsInput>
  }

  export type TranscriptUpdateManyWithoutSessionNestedInput = {
    create?: XOR<TranscriptCreateWithoutSessionInput, TranscriptUncheckedCreateWithoutSessionInput> | TranscriptCreateWithoutSessionInput[] | TranscriptUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: TranscriptCreateOrConnectWithoutSessionInput | TranscriptCreateOrConnectWithoutSessionInput[]
    upsert?: TranscriptUpsertWithWhereUniqueWithoutSessionInput | TranscriptUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: TranscriptCreateManySessionInputEnvelope
    set?: TranscriptWhereUniqueInput | TranscriptWhereUniqueInput[]
    disconnect?: TranscriptWhereUniqueInput | TranscriptWhereUniqueInput[]
    delete?: TranscriptWhereUniqueInput | TranscriptWhereUniqueInput[]
    connect?: TranscriptWhereUniqueInput | TranscriptWhereUniqueInput[]
    update?: TranscriptUpdateWithWhereUniqueWithoutSessionInput | TranscriptUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: TranscriptUpdateManyWithWhereWithoutSessionInput | TranscriptUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: TranscriptScalarWhereInput | TranscriptScalarWhereInput[]
  }

  export type FeedbackUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<FeedbackCreateWithoutSessionInput, FeedbackUncheckedCreateWithoutSessionInput> | FeedbackCreateWithoutSessionInput[] | FeedbackUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: FeedbackCreateOrConnectWithoutSessionInput | FeedbackCreateOrConnectWithoutSessionInput[]
    upsert?: FeedbackUpsertWithWhereUniqueWithoutSessionInput | FeedbackUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: FeedbackCreateManySessionInputEnvelope
    set?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    disconnect?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    delete?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    connect?: FeedbackWhereUniqueInput | FeedbackWhereUniqueInput[]
    update?: FeedbackUpdateWithWhereUniqueWithoutSessionInput | FeedbackUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: FeedbackUpdateManyWithWhereWithoutSessionInput | FeedbackUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: FeedbackScalarWhereInput | FeedbackScalarWhereInput[]
  }

  export type TranscriptUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<TranscriptCreateWithoutSessionInput, TranscriptUncheckedCreateWithoutSessionInput> | TranscriptCreateWithoutSessionInput[] | TranscriptUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: TranscriptCreateOrConnectWithoutSessionInput | TranscriptCreateOrConnectWithoutSessionInput[]
    upsert?: TranscriptUpsertWithWhereUniqueWithoutSessionInput | TranscriptUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: TranscriptCreateManySessionInputEnvelope
    set?: TranscriptWhereUniqueInput | TranscriptWhereUniqueInput[]
    disconnect?: TranscriptWhereUniqueInput | TranscriptWhereUniqueInput[]
    delete?: TranscriptWhereUniqueInput | TranscriptWhereUniqueInput[]
    connect?: TranscriptWhereUniqueInput | TranscriptWhereUniqueInput[]
    update?: TranscriptUpdateWithWhereUniqueWithoutSessionInput | TranscriptUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: TranscriptUpdateManyWithWhereWithoutSessionInput | TranscriptUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: TranscriptScalarWhereInput | TranscriptScalarWhereInput[]
  }

  export type InterviewSessionCreateNestedOneWithoutTranscriptsInput = {
    create?: XOR<InterviewSessionCreateWithoutTranscriptsInput, InterviewSessionUncheckedCreateWithoutTranscriptsInput>
    connectOrCreate?: InterviewSessionCreateOrConnectWithoutTranscriptsInput
    connect?: InterviewSessionWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type InterviewSessionUpdateOneRequiredWithoutTranscriptsNestedInput = {
    create?: XOR<InterviewSessionCreateWithoutTranscriptsInput, InterviewSessionUncheckedCreateWithoutTranscriptsInput>
    connectOrCreate?: InterviewSessionCreateOrConnectWithoutTranscriptsInput
    upsert?: InterviewSessionUpsertWithoutTranscriptsInput
    connect?: InterviewSessionWhereUniqueInput
    update?: XOR<XOR<InterviewSessionUpdateToOneWithWhereWithoutTranscriptsInput, InterviewSessionUpdateWithoutTranscriptsInput>, InterviewSessionUncheckedUpdateWithoutTranscriptsInput>
  }

  export type InterviewSessionCreateNestedOneWithoutFeedbacksInput = {
    create?: XOR<InterviewSessionCreateWithoutFeedbacksInput, InterviewSessionUncheckedCreateWithoutFeedbacksInput>
    connectOrCreate?: InterviewSessionCreateOrConnectWithoutFeedbacksInput
    connect?: InterviewSessionWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutFeedbacksInput = {
    create?: XOR<UserCreateWithoutFeedbacksInput, UserUncheckedCreateWithoutFeedbacksInput>
    connectOrCreate?: UserCreateOrConnectWithoutFeedbacksInput
    connect?: UserWhereUniqueInput
  }

  export type InterviewSessionUpdateOneRequiredWithoutFeedbacksNestedInput = {
    create?: XOR<InterviewSessionCreateWithoutFeedbacksInput, InterviewSessionUncheckedCreateWithoutFeedbacksInput>
    connectOrCreate?: InterviewSessionCreateOrConnectWithoutFeedbacksInput
    upsert?: InterviewSessionUpsertWithoutFeedbacksInput
    connect?: InterviewSessionWhereUniqueInput
    update?: XOR<XOR<InterviewSessionUpdateToOneWithWhereWithoutFeedbacksInput, InterviewSessionUpdateWithoutFeedbacksInput>, InterviewSessionUncheckedUpdateWithoutFeedbacksInput>
  }

  export type UserUpdateOneRequiredWithoutFeedbacksNestedInput = {
    create?: XOR<UserCreateWithoutFeedbacksInput, UserUncheckedCreateWithoutFeedbacksInput>
    connectOrCreate?: UserCreateOrConnectWithoutFeedbacksInput
    upsert?: UserUpsertWithoutFeedbacksInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutFeedbacksInput, UserUpdateWithoutFeedbacksInput>, UserUncheckedUpdateWithoutFeedbacksInput>
  }

  export type UserCreateNestedOneWithoutUsageEventsInput = {
    create?: XOR<UserCreateWithoutUsageEventsInput, UserUncheckedCreateWithoutUsageEventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutUsageEventsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneWithoutUsageEventsNestedInput = {
    create?: XOR<UserCreateWithoutUsageEventsInput, UserUncheckedCreateWithoutUsageEventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutUsageEventsInput
    upsert?: UserUpsertWithoutUsageEventsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUsageEventsInput, UserUpdateWithoutUsageEventsInput>, UserUncheckedUpdateWithoutUsageEventsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type FeedbackCreateWithoutUserInput = {
    id?: string
    summary: string
    strengths?: string | null
    areasForImprovement?: string | null
    fillerWordCount?: number | null
    transcriptScore?: number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: number | null
    concisenessScore?: number | null
    technicalDepthScore?: number | null
    starMethodScore?: number | null
    overallScore?: number | null
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    session: InterviewSessionCreateNestedOneWithoutFeedbacksInput
  }

  export type FeedbackUncheckedCreateWithoutUserInput = {
    id?: string
    sessionId: string
    summary: string
    strengths?: string | null
    areasForImprovement?: string | null
    fillerWordCount?: number | null
    transcriptScore?: number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: number | null
    concisenessScore?: number | null
    technicalDepthScore?: number | null
    starMethodScore?: number | null
    overallScore?: number | null
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FeedbackCreateOrConnectWithoutUserInput = {
    where: FeedbackWhereUniqueInput
    create: XOR<FeedbackCreateWithoutUserInput, FeedbackUncheckedCreateWithoutUserInput>
  }

  export type FeedbackCreateManyUserInputEnvelope = {
    data: FeedbackCreateManyUserInput | FeedbackCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type InterviewSessionCreateWithoutUserInput = {
    id?: string
    jobTitle: string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: string | null
    interviewType?: string | null
    jdContext?: string | null
    openaiSessionId?: string | null
    fallbackMode?: boolean
    startTime?: Date | string | null
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    feedbackStatus?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    endedAt?: Date | string | null
    durationSeconds?: number | null
    audioUrl?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    feedbacks?: FeedbackCreateNestedManyWithoutSessionInput
    transcripts?: TranscriptCreateNestedManyWithoutSessionInput
  }

  export type InterviewSessionUncheckedCreateWithoutUserInput = {
    id?: string
    jobTitle: string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: string | null
    interviewType?: string | null
    jdContext?: string | null
    openaiSessionId?: string | null
    fallbackMode?: boolean
    startTime?: Date | string | null
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    feedbackStatus?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    endedAt?: Date | string | null
    durationSeconds?: number | null
    audioUrl?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    feedbacks?: FeedbackUncheckedCreateNestedManyWithoutSessionInput
    transcripts?: TranscriptUncheckedCreateNestedManyWithoutSessionInput
  }

  export type InterviewSessionCreateOrConnectWithoutUserInput = {
    where: InterviewSessionWhereUniqueInput
    create: XOR<InterviewSessionCreateWithoutUserInput, InterviewSessionUncheckedCreateWithoutUserInput>
  }

  export type InterviewSessionCreateManyUserInputEnvelope = {
    data: InterviewSessionCreateManyUserInput | InterviewSessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UsageEventCreateWithoutUserInput = {
    id: string
    eventType: string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UsageEventUncheckedCreateWithoutUserInput = {
    id: string
    eventType: string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UsageEventCreateOrConnectWithoutUserInput = {
    where: UsageEventWhereUniqueInput
    create: XOR<UsageEventCreateWithoutUserInput, UsageEventUncheckedCreateWithoutUserInput>
  }

  export type UsageEventCreateManyUserInputEnvelope = {
    data: UsageEventCreateManyUserInput | UsageEventCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type FeedbackUpsertWithWhereUniqueWithoutUserInput = {
    where: FeedbackWhereUniqueInput
    update: XOR<FeedbackUpdateWithoutUserInput, FeedbackUncheckedUpdateWithoutUserInput>
    create: XOR<FeedbackCreateWithoutUserInput, FeedbackUncheckedCreateWithoutUserInput>
  }

  export type FeedbackUpdateWithWhereUniqueWithoutUserInput = {
    where: FeedbackWhereUniqueInput
    data: XOR<FeedbackUpdateWithoutUserInput, FeedbackUncheckedUpdateWithoutUserInput>
  }

  export type FeedbackUpdateManyWithWhereWithoutUserInput = {
    where: FeedbackScalarWhereInput
    data: XOR<FeedbackUpdateManyMutationInput, FeedbackUncheckedUpdateManyWithoutUserInput>
  }

  export type FeedbackScalarWhereInput = {
    AND?: FeedbackScalarWhereInput | FeedbackScalarWhereInput[]
    OR?: FeedbackScalarWhereInput[]
    NOT?: FeedbackScalarWhereInput | FeedbackScalarWhereInput[]
    id?: StringFilter<"Feedback"> | string
    sessionId?: StringFilter<"Feedback"> | string
    userId?: StringFilter<"Feedback"> | string
    summary?: StringFilter<"Feedback"> | string
    strengths?: StringNullableFilter<"Feedback"> | string | null
    areasForImprovement?: StringNullableFilter<"Feedback"> | string | null
    fillerWordCount?: IntNullableFilter<"Feedback"> | number | null
    transcriptScore?: FloatNullableFilter<"Feedback"> | number | null
    structuredData?: JsonNullableFilter<"Feedback">
    clarityScore?: FloatNullableFilter<"Feedback"> | number | null
    concisenessScore?: FloatNullableFilter<"Feedback"> | number | null
    technicalDepthScore?: FloatNullableFilter<"Feedback"> | number | null
    starMethodScore?: FloatNullableFilter<"Feedback"> | number | null
    overallScore?: FloatNullableFilter<"Feedback"> | number | null
    enhancedFeedbackGenerated?: BoolFilter<"Feedback"> | boolean
    enhancedReportData?: JsonNullableFilter<"Feedback">
    toneAnalysis?: JsonNullableFilter<"Feedback">
    keywordRelevanceScore?: FloatNullableFilter<"Feedback"> | number | null
    sentimentProgression?: JsonNullableFilter<"Feedback">
    enhancedGeneratedAt?: DateTimeNullableFilter<"Feedback"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"Feedback"> | Date | string | null
    createdAt?: DateTimeFilter<"Feedback"> | Date | string
    updatedAt?: DateTimeFilter<"Feedback"> | Date | string
  }

  export type InterviewSessionUpsertWithWhereUniqueWithoutUserInput = {
    where: InterviewSessionWhereUniqueInput
    update: XOR<InterviewSessionUpdateWithoutUserInput, InterviewSessionUncheckedUpdateWithoutUserInput>
    create: XOR<InterviewSessionCreateWithoutUserInput, InterviewSessionUncheckedCreateWithoutUserInput>
  }

  export type InterviewSessionUpdateWithWhereUniqueWithoutUserInput = {
    where: InterviewSessionWhereUniqueInput
    data: XOR<InterviewSessionUpdateWithoutUserInput, InterviewSessionUncheckedUpdateWithoutUserInput>
  }

  export type InterviewSessionUpdateManyWithWhereWithoutUserInput = {
    where: InterviewSessionScalarWhereInput
    data: XOR<InterviewSessionUpdateManyMutationInput, InterviewSessionUncheckedUpdateManyWithoutUserInput>
  }

  export type InterviewSessionScalarWhereInput = {
    AND?: InterviewSessionScalarWhereInput | InterviewSessionScalarWhereInput[]
    OR?: InterviewSessionScalarWhereInput[]
    NOT?: InterviewSessionScalarWhereInput | InterviewSessionScalarWhereInput[]
    id?: StringFilter<"InterviewSession"> | string
    userId?: StringFilter<"InterviewSession"> | string
    jobTitle?: StringFilter<"InterviewSession"> | string
    resumeData?: JsonNullableFilter<"InterviewSession">
    resumeSnapshot?: JsonNullableFilter<"InterviewSession">
    company?: StringNullableFilter<"InterviewSession"> | string | null
    interviewType?: StringNullableFilter<"InterviewSession"> | string | null
    jdContext?: StringNullableFilter<"InterviewSession"> | string | null
    openaiSessionId?: StringNullableFilter<"InterviewSession"> | string | null
    fallbackMode?: BoolFilter<"InterviewSession"> | boolean
    startTime?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    endTime?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    duration?: IntNullableFilter<"InterviewSession"> | number | null
    status?: StringFilter<"InterviewSession"> | string
    feedbackStatus?: StringFilter<"InterviewSession"> | string
    metadata?: JsonNullableFilter<"InterviewSession">
    startedAt?: DateTimeFilter<"InterviewSession"> | Date | string
    endedAt?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    durationSeconds?: IntNullableFilter<"InterviewSession"> | number | null
    audioUrl?: StringNullableFilter<"InterviewSession"> | string | null
    expiresAt?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    createdAt?: DateTimeFilter<"InterviewSession"> | Date | string
    updatedAt?: DateTimeFilter<"InterviewSession"> | Date | string
    deletedAt?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
  }

  export type UsageEventUpsertWithWhereUniqueWithoutUserInput = {
    where: UsageEventWhereUniqueInput
    update: XOR<UsageEventUpdateWithoutUserInput, UsageEventUncheckedUpdateWithoutUserInput>
    create: XOR<UsageEventCreateWithoutUserInput, UsageEventUncheckedCreateWithoutUserInput>
  }

  export type UsageEventUpdateWithWhereUniqueWithoutUserInput = {
    where: UsageEventWhereUniqueInput
    data: XOR<UsageEventUpdateWithoutUserInput, UsageEventUncheckedUpdateWithoutUserInput>
  }

  export type UsageEventUpdateManyWithWhereWithoutUserInput = {
    where: UsageEventScalarWhereInput
    data: XOR<UsageEventUpdateManyMutationInput, UsageEventUncheckedUpdateManyWithoutUserInput>
  }

  export type UsageEventScalarWhereInput = {
    AND?: UsageEventScalarWhereInput | UsageEventScalarWhereInput[]
    OR?: UsageEventScalarWhereInput[]
    NOT?: UsageEventScalarWhereInput | UsageEventScalarWhereInput[]
    id?: StringFilter<"UsageEvent"> | string
    userId?: StringNullableFilter<"UsageEvent"> | string | null
    eventType?: StringFilter<"UsageEvent"> | string
    details?: JsonNullableFilter<"UsageEvent">
    occurredAt?: DateTimeFilter<"UsageEvent"> | Date | string
    createdAt?: DateTimeFilter<"UsageEvent"> | Date | string
    updatedAt?: DateTimeFilter<"UsageEvent"> | Date | string
  }

  export type FeedbackCreateWithoutSessionInput = {
    id?: string
    summary: string
    strengths?: string | null
    areasForImprovement?: string | null
    fillerWordCount?: number | null
    transcriptScore?: number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: number | null
    concisenessScore?: number | null
    technicalDepthScore?: number | null
    starMethodScore?: number | null
    overallScore?: number | null
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutFeedbacksInput
  }

  export type FeedbackUncheckedCreateWithoutSessionInput = {
    id?: string
    userId: string
    summary: string
    strengths?: string | null
    areasForImprovement?: string | null
    fillerWordCount?: number | null
    transcriptScore?: number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: number | null
    concisenessScore?: number | null
    technicalDepthScore?: number | null
    starMethodScore?: number | null
    overallScore?: number | null
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FeedbackCreateOrConnectWithoutSessionInput = {
    where: FeedbackWhereUniqueInput
    create: XOR<FeedbackCreateWithoutSessionInput, FeedbackUncheckedCreateWithoutSessionInput>
  }

  export type FeedbackCreateManySessionInputEnvelope = {
    data: FeedbackCreateManySessionInput | FeedbackCreateManySessionInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutInterviewSessionsInput = {
    id: string
    clerkId: string
    role?: $Enums.UserRole
    credits?: Decimal | DecimalJsLike | number | string
    resumeJobTitle?: string | null
    resumeSkills?: string | null
    resumeExperience?: string | null
    resumeEducation?: string | null
    resumeAchievements?: string | null
    resumeFileUrl?: string | null
    jobSearchStage?: string | null
    linkedinUrl?: string | null
    acceptedTermsAt?: Date | string | null
    acceptedPrivacyAt?: Date | string | null
    dataRetentionOverride?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
    premiumExpiresAt?: Date | string | null
    premiumSubscriptionId?: string | null
    stripeCustomerId?: string | null
    isPremium?: boolean
    email?: string | null
    image?: string | null
    name?: string | null
    feedbacks?: FeedbackCreateNestedManyWithoutUserInput
    usageEvents?: UsageEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutInterviewSessionsInput = {
    id: string
    clerkId: string
    role?: $Enums.UserRole
    credits?: Decimal | DecimalJsLike | number | string
    resumeJobTitle?: string | null
    resumeSkills?: string | null
    resumeExperience?: string | null
    resumeEducation?: string | null
    resumeAchievements?: string | null
    resumeFileUrl?: string | null
    jobSearchStage?: string | null
    linkedinUrl?: string | null
    acceptedTermsAt?: Date | string | null
    acceptedPrivacyAt?: Date | string | null
    dataRetentionOverride?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
    premiumExpiresAt?: Date | string | null
    premiumSubscriptionId?: string | null
    stripeCustomerId?: string | null
    isPremium?: boolean
    email?: string | null
    image?: string | null
    name?: string | null
    feedbacks?: FeedbackUncheckedCreateNestedManyWithoutUserInput
    usageEvents?: UsageEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutInterviewSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutInterviewSessionsInput, UserUncheckedCreateWithoutInterviewSessionsInput>
  }

  export type TranscriptCreateWithoutSessionInput = {
    id?: string
    role: string
    content: string
    confidence?: number | null
    timestamp: Date | string
    sequenceNumber?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TranscriptUncheckedCreateWithoutSessionInput = {
    id?: string
    role: string
    content: string
    confidence?: number | null
    timestamp: Date | string
    sequenceNumber?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TranscriptCreateOrConnectWithoutSessionInput = {
    where: TranscriptWhereUniqueInput
    create: XOR<TranscriptCreateWithoutSessionInput, TranscriptUncheckedCreateWithoutSessionInput>
  }

  export type TranscriptCreateManySessionInputEnvelope = {
    data: TranscriptCreateManySessionInput | TranscriptCreateManySessionInput[]
    skipDuplicates?: boolean
  }

  export type FeedbackUpsertWithWhereUniqueWithoutSessionInput = {
    where: FeedbackWhereUniqueInput
    update: XOR<FeedbackUpdateWithoutSessionInput, FeedbackUncheckedUpdateWithoutSessionInput>
    create: XOR<FeedbackCreateWithoutSessionInput, FeedbackUncheckedCreateWithoutSessionInput>
  }

  export type FeedbackUpdateWithWhereUniqueWithoutSessionInput = {
    where: FeedbackWhereUniqueInput
    data: XOR<FeedbackUpdateWithoutSessionInput, FeedbackUncheckedUpdateWithoutSessionInput>
  }

  export type FeedbackUpdateManyWithWhereWithoutSessionInput = {
    where: FeedbackScalarWhereInput
    data: XOR<FeedbackUpdateManyMutationInput, FeedbackUncheckedUpdateManyWithoutSessionInput>
  }

  export type UserUpsertWithoutInterviewSessionsInput = {
    update: XOR<UserUpdateWithoutInterviewSessionsInput, UserUncheckedUpdateWithoutInterviewSessionsInput>
    create: XOR<UserCreateWithoutInterviewSessionsInput, UserUncheckedCreateWithoutInterviewSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutInterviewSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutInterviewSessionsInput, UserUncheckedUpdateWithoutInterviewSessionsInput>
  }

  export type UserUpdateWithoutInterviewSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    credits?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    resumeSkills?: NullableStringFieldUpdateOperationsInput | string | null
    resumeExperience?: NullableStringFieldUpdateOperationsInput | string | null
    resumeEducation?: NullableStringFieldUpdateOperationsInput | string | null
    resumeAchievements?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    jobSearchStage?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedTermsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedPrivacyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dataRetentionOverride?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    premiumExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    premiumSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    email?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    feedbacks?: FeedbackUpdateManyWithoutUserNestedInput
    usageEvents?: UsageEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutInterviewSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    credits?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    resumeSkills?: NullableStringFieldUpdateOperationsInput | string | null
    resumeExperience?: NullableStringFieldUpdateOperationsInput | string | null
    resumeEducation?: NullableStringFieldUpdateOperationsInput | string | null
    resumeAchievements?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    jobSearchStage?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedTermsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedPrivacyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dataRetentionOverride?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    premiumExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    premiumSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    email?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    feedbacks?: FeedbackUncheckedUpdateManyWithoutUserNestedInput
    usageEvents?: UsageEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type TranscriptUpsertWithWhereUniqueWithoutSessionInput = {
    where: TranscriptWhereUniqueInput
    update: XOR<TranscriptUpdateWithoutSessionInput, TranscriptUncheckedUpdateWithoutSessionInput>
    create: XOR<TranscriptCreateWithoutSessionInput, TranscriptUncheckedCreateWithoutSessionInput>
  }

  export type TranscriptUpdateWithWhereUniqueWithoutSessionInput = {
    where: TranscriptWhereUniqueInput
    data: XOR<TranscriptUpdateWithoutSessionInput, TranscriptUncheckedUpdateWithoutSessionInput>
  }

  export type TranscriptUpdateManyWithWhereWithoutSessionInput = {
    where: TranscriptScalarWhereInput
    data: XOR<TranscriptUpdateManyMutationInput, TranscriptUncheckedUpdateManyWithoutSessionInput>
  }

  export type TranscriptScalarWhereInput = {
    AND?: TranscriptScalarWhereInput | TranscriptScalarWhereInput[]
    OR?: TranscriptScalarWhereInput[]
    NOT?: TranscriptScalarWhereInput | TranscriptScalarWhereInput[]
    id?: StringFilter<"Transcript"> | string
    sessionId?: StringFilter<"Transcript"> | string
    role?: StringFilter<"Transcript"> | string
    content?: StringFilter<"Transcript"> | string
    confidence?: FloatNullableFilter<"Transcript"> | number | null
    timestamp?: DateTimeFilter<"Transcript"> | Date | string
    sequenceNumber?: IntFilter<"Transcript"> | number
    metadata?: JsonNullableFilter<"Transcript">
    expiresAt?: DateTimeNullableFilter<"Transcript"> | Date | string | null
    createdAt?: DateTimeFilter<"Transcript"> | Date | string
    updatedAt?: DateTimeFilter<"Transcript"> | Date | string
  }

  export type InterviewSessionCreateWithoutTranscriptsInput = {
    id?: string
    jobTitle: string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: string | null
    interviewType?: string | null
    jdContext?: string | null
    openaiSessionId?: string | null
    fallbackMode?: boolean
    startTime?: Date | string | null
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    feedbackStatus?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    endedAt?: Date | string | null
    durationSeconds?: number | null
    audioUrl?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    feedbacks?: FeedbackCreateNestedManyWithoutSessionInput
    user: UserCreateNestedOneWithoutInterviewSessionsInput
  }

  export type InterviewSessionUncheckedCreateWithoutTranscriptsInput = {
    id?: string
    userId: string
    jobTitle: string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: string | null
    interviewType?: string | null
    jdContext?: string | null
    openaiSessionId?: string | null
    fallbackMode?: boolean
    startTime?: Date | string | null
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    feedbackStatus?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    endedAt?: Date | string | null
    durationSeconds?: number | null
    audioUrl?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    feedbacks?: FeedbackUncheckedCreateNestedManyWithoutSessionInput
  }

  export type InterviewSessionCreateOrConnectWithoutTranscriptsInput = {
    where: InterviewSessionWhereUniqueInput
    create: XOR<InterviewSessionCreateWithoutTranscriptsInput, InterviewSessionUncheckedCreateWithoutTranscriptsInput>
  }

  export type InterviewSessionUpsertWithoutTranscriptsInput = {
    update: XOR<InterviewSessionUpdateWithoutTranscriptsInput, InterviewSessionUncheckedUpdateWithoutTranscriptsInput>
    create: XOR<InterviewSessionCreateWithoutTranscriptsInput, InterviewSessionUncheckedCreateWithoutTranscriptsInput>
    where?: InterviewSessionWhereInput
  }

  export type InterviewSessionUpdateToOneWithWhereWithoutTranscriptsInput = {
    where?: InterviewSessionWhereInput
    data: XOR<InterviewSessionUpdateWithoutTranscriptsInput, InterviewSessionUncheckedUpdateWithoutTranscriptsInput>
  }

  export type InterviewSessionUpdateWithoutTranscriptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: NullableStringFieldUpdateOperationsInput | string | null
    interviewType?: NullableStringFieldUpdateOperationsInput | string | null
    jdContext?: NullableStringFieldUpdateOperationsInput | string | null
    openaiSessionId?: NullableStringFieldUpdateOperationsInput | string | null
    fallbackMode?: BoolFieldUpdateOperationsInput | boolean
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    feedbackStatus?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    feedbacks?: FeedbackUpdateManyWithoutSessionNestedInput
    user?: UserUpdateOneRequiredWithoutInterviewSessionsNestedInput
  }

  export type InterviewSessionUncheckedUpdateWithoutTranscriptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: NullableStringFieldUpdateOperationsInput | string | null
    interviewType?: NullableStringFieldUpdateOperationsInput | string | null
    jdContext?: NullableStringFieldUpdateOperationsInput | string | null
    openaiSessionId?: NullableStringFieldUpdateOperationsInput | string | null
    fallbackMode?: BoolFieldUpdateOperationsInput | boolean
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    feedbackStatus?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    feedbacks?: FeedbackUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type InterviewSessionCreateWithoutFeedbacksInput = {
    id?: string
    jobTitle: string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: string | null
    interviewType?: string | null
    jdContext?: string | null
    openaiSessionId?: string | null
    fallbackMode?: boolean
    startTime?: Date | string | null
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    feedbackStatus?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    endedAt?: Date | string | null
    durationSeconds?: number | null
    audioUrl?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    user: UserCreateNestedOneWithoutInterviewSessionsInput
    transcripts?: TranscriptCreateNestedManyWithoutSessionInput
  }

  export type InterviewSessionUncheckedCreateWithoutFeedbacksInput = {
    id?: string
    userId: string
    jobTitle: string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: string | null
    interviewType?: string | null
    jdContext?: string | null
    openaiSessionId?: string | null
    fallbackMode?: boolean
    startTime?: Date | string | null
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    feedbackStatus?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    endedAt?: Date | string | null
    durationSeconds?: number | null
    audioUrl?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    transcripts?: TranscriptUncheckedCreateNestedManyWithoutSessionInput
  }

  export type InterviewSessionCreateOrConnectWithoutFeedbacksInput = {
    where: InterviewSessionWhereUniqueInput
    create: XOR<InterviewSessionCreateWithoutFeedbacksInput, InterviewSessionUncheckedCreateWithoutFeedbacksInput>
  }

  export type UserCreateWithoutFeedbacksInput = {
    id: string
    clerkId: string
    role?: $Enums.UserRole
    credits?: Decimal | DecimalJsLike | number | string
    resumeJobTitle?: string | null
    resumeSkills?: string | null
    resumeExperience?: string | null
    resumeEducation?: string | null
    resumeAchievements?: string | null
    resumeFileUrl?: string | null
    jobSearchStage?: string | null
    linkedinUrl?: string | null
    acceptedTermsAt?: Date | string | null
    acceptedPrivacyAt?: Date | string | null
    dataRetentionOverride?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
    premiumExpiresAt?: Date | string | null
    premiumSubscriptionId?: string | null
    stripeCustomerId?: string | null
    isPremium?: boolean
    email?: string | null
    image?: string | null
    name?: string | null
    interviewSessions?: InterviewSessionCreateNestedManyWithoutUserInput
    usageEvents?: UsageEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutFeedbacksInput = {
    id: string
    clerkId: string
    role?: $Enums.UserRole
    credits?: Decimal | DecimalJsLike | number | string
    resumeJobTitle?: string | null
    resumeSkills?: string | null
    resumeExperience?: string | null
    resumeEducation?: string | null
    resumeAchievements?: string | null
    resumeFileUrl?: string | null
    jobSearchStage?: string | null
    linkedinUrl?: string | null
    acceptedTermsAt?: Date | string | null
    acceptedPrivacyAt?: Date | string | null
    dataRetentionOverride?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
    premiumExpiresAt?: Date | string | null
    premiumSubscriptionId?: string | null
    stripeCustomerId?: string | null
    isPremium?: boolean
    email?: string | null
    image?: string | null
    name?: string | null
    interviewSessions?: InterviewSessionUncheckedCreateNestedManyWithoutUserInput
    usageEvents?: UsageEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutFeedbacksInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutFeedbacksInput, UserUncheckedCreateWithoutFeedbacksInput>
  }

  export type InterviewSessionUpsertWithoutFeedbacksInput = {
    update: XOR<InterviewSessionUpdateWithoutFeedbacksInput, InterviewSessionUncheckedUpdateWithoutFeedbacksInput>
    create: XOR<InterviewSessionCreateWithoutFeedbacksInput, InterviewSessionUncheckedCreateWithoutFeedbacksInput>
    where?: InterviewSessionWhereInput
  }

  export type InterviewSessionUpdateToOneWithWhereWithoutFeedbacksInput = {
    where?: InterviewSessionWhereInput
    data: XOR<InterviewSessionUpdateWithoutFeedbacksInput, InterviewSessionUncheckedUpdateWithoutFeedbacksInput>
  }

  export type InterviewSessionUpdateWithoutFeedbacksInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: NullableStringFieldUpdateOperationsInput | string | null
    interviewType?: NullableStringFieldUpdateOperationsInput | string | null
    jdContext?: NullableStringFieldUpdateOperationsInput | string | null
    openaiSessionId?: NullableStringFieldUpdateOperationsInput | string | null
    fallbackMode?: BoolFieldUpdateOperationsInput | boolean
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    feedbackStatus?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutInterviewSessionsNestedInput
    transcripts?: TranscriptUpdateManyWithoutSessionNestedInput
  }

  export type InterviewSessionUncheckedUpdateWithoutFeedbacksInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: NullableStringFieldUpdateOperationsInput | string | null
    interviewType?: NullableStringFieldUpdateOperationsInput | string | null
    jdContext?: NullableStringFieldUpdateOperationsInput | string | null
    openaiSessionId?: NullableStringFieldUpdateOperationsInput | string | null
    fallbackMode?: BoolFieldUpdateOperationsInput | boolean
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    feedbackStatus?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    transcripts?: TranscriptUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type UserUpsertWithoutFeedbacksInput = {
    update: XOR<UserUpdateWithoutFeedbacksInput, UserUncheckedUpdateWithoutFeedbacksInput>
    create: XOR<UserCreateWithoutFeedbacksInput, UserUncheckedCreateWithoutFeedbacksInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutFeedbacksInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutFeedbacksInput, UserUncheckedUpdateWithoutFeedbacksInput>
  }

  export type UserUpdateWithoutFeedbacksInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    credits?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    resumeSkills?: NullableStringFieldUpdateOperationsInput | string | null
    resumeExperience?: NullableStringFieldUpdateOperationsInput | string | null
    resumeEducation?: NullableStringFieldUpdateOperationsInput | string | null
    resumeAchievements?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    jobSearchStage?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedTermsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedPrivacyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dataRetentionOverride?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    premiumExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    premiumSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    email?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    interviewSessions?: InterviewSessionUpdateManyWithoutUserNestedInput
    usageEvents?: UsageEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutFeedbacksInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    credits?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    resumeSkills?: NullableStringFieldUpdateOperationsInput | string | null
    resumeExperience?: NullableStringFieldUpdateOperationsInput | string | null
    resumeEducation?: NullableStringFieldUpdateOperationsInput | string | null
    resumeAchievements?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    jobSearchStage?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedTermsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedPrivacyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dataRetentionOverride?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    premiumExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    premiumSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    email?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    interviewSessions?: InterviewSessionUncheckedUpdateManyWithoutUserNestedInput
    usageEvents?: UsageEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutUsageEventsInput = {
    id: string
    clerkId: string
    role?: $Enums.UserRole
    credits?: Decimal | DecimalJsLike | number | string
    resumeJobTitle?: string | null
    resumeSkills?: string | null
    resumeExperience?: string | null
    resumeEducation?: string | null
    resumeAchievements?: string | null
    resumeFileUrl?: string | null
    jobSearchStage?: string | null
    linkedinUrl?: string | null
    acceptedTermsAt?: Date | string | null
    acceptedPrivacyAt?: Date | string | null
    dataRetentionOverride?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
    premiumExpiresAt?: Date | string | null
    premiumSubscriptionId?: string | null
    stripeCustomerId?: string | null
    isPremium?: boolean
    email?: string | null
    image?: string | null
    name?: string | null
    feedbacks?: FeedbackCreateNestedManyWithoutUserInput
    interviewSessions?: InterviewSessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutUsageEventsInput = {
    id: string
    clerkId: string
    role?: $Enums.UserRole
    credits?: Decimal | DecimalJsLike | number | string
    resumeJobTitle?: string | null
    resumeSkills?: string | null
    resumeExperience?: string | null
    resumeEducation?: string | null
    resumeAchievements?: string | null
    resumeFileUrl?: string | null
    jobSearchStage?: string | null
    linkedinUrl?: string | null
    acceptedTermsAt?: Date | string | null
    acceptedPrivacyAt?: Date | string | null
    dataRetentionOverride?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
    premiumExpiresAt?: Date | string | null
    premiumSubscriptionId?: string | null
    stripeCustomerId?: string | null
    isPremium?: boolean
    email?: string | null
    image?: string | null
    name?: string | null
    feedbacks?: FeedbackUncheckedCreateNestedManyWithoutUserInput
    interviewSessions?: InterviewSessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutUsageEventsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUsageEventsInput, UserUncheckedCreateWithoutUsageEventsInput>
  }

  export type UserUpsertWithoutUsageEventsInput = {
    update: XOR<UserUpdateWithoutUsageEventsInput, UserUncheckedUpdateWithoutUsageEventsInput>
    create: XOR<UserCreateWithoutUsageEventsInput, UserUncheckedCreateWithoutUsageEventsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUsageEventsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUsageEventsInput, UserUncheckedUpdateWithoutUsageEventsInput>
  }

  export type UserUpdateWithoutUsageEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    credits?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    resumeSkills?: NullableStringFieldUpdateOperationsInput | string | null
    resumeExperience?: NullableStringFieldUpdateOperationsInput | string | null
    resumeEducation?: NullableStringFieldUpdateOperationsInput | string | null
    resumeAchievements?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    jobSearchStage?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedTermsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedPrivacyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dataRetentionOverride?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    premiumExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    premiumSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    email?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    feedbacks?: FeedbackUpdateManyWithoutUserNestedInput
    interviewSessions?: InterviewSessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutUsageEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    credits?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resumeJobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    resumeSkills?: NullableStringFieldUpdateOperationsInput | string | null
    resumeExperience?: NullableStringFieldUpdateOperationsInput | string | null
    resumeEducation?: NullableStringFieldUpdateOperationsInput | string | null
    resumeAchievements?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    jobSearchStage?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedTermsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedPrivacyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dataRetentionOverride?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    premiumExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    premiumSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    email?: NullableStringFieldUpdateOperationsInput | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    feedbacks?: FeedbackUncheckedUpdateManyWithoutUserNestedInput
    interviewSessions?: InterviewSessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type FeedbackCreateManyUserInput = {
    id?: string
    sessionId: string
    summary: string
    strengths?: string | null
    areasForImprovement?: string | null
    fillerWordCount?: number | null
    transcriptScore?: number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: number | null
    concisenessScore?: number | null
    technicalDepthScore?: number | null
    starMethodScore?: number | null
    overallScore?: number | null
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewSessionCreateManyUserInput = {
    id?: string
    jobTitle: string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: string | null
    interviewType?: string | null
    jdContext?: string | null
    openaiSessionId?: string | null
    fallbackMode?: boolean
    startTime?: Date | string | null
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    feedbackStatus?: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    endedAt?: Date | string | null
    durationSeconds?: number | null
    audioUrl?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type UsageEventCreateManyUserInput = {
    id: string
    eventType: string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FeedbackUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    strengths?: NullableStringFieldUpdateOperationsInput | string | null
    areasForImprovement?: NullableStringFieldUpdateOperationsInput | string | null
    fillerWordCount?: NullableIntFieldUpdateOperationsInput | number | null
    transcriptScore?: NullableFloatFieldUpdateOperationsInput | number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    concisenessScore?: NullableFloatFieldUpdateOperationsInput | number | null
    technicalDepthScore?: NullableFloatFieldUpdateOperationsInput | number | null
    starMethodScore?: NullableFloatFieldUpdateOperationsInput | number | null
    overallScore?: NullableFloatFieldUpdateOperationsInput | number | null
    enhancedFeedbackGenerated?: BoolFieldUpdateOperationsInput | boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: InterviewSessionUpdateOneRequiredWithoutFeedbacksNestedInput
  }

  export type FeedbackUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    strengths?: NullableStringFieldUpdateOperationsInput | string | null
    areasForImprovement?: NullableStringFieldUpdateOperationsInput | string | null
    fillerWordCount?: NullableIntFieldUpdateOperationsInput | number | null
    transcriptScore?: NullableFloatFieldUpdateOperationsInput | number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    concisenessScore?: NullableFloatFieldUpdateOperationsInput | number | null
    technicalDepthScore?: NullableFloatFieldUpdateOperationsInput | number | null
    starMethodScore?: NullableFloatFieldUpdateOperationsInput | number | null
    overallScore?: NullableFloatFieldUpdateOperationsInput | number | null
    enhancedFeedbackGenerated?: BoolFieldUpdateOperationsInput | boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeedbackUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    strengths?: NullableStringFieldUpdateOperationsInput | string | null
    areasForImprovement?: NullableStringFieldUpdateOperationsInput | string | null
    fillerWordCount?: NullableIntFieldUpdateOperationsInput | number | null
    transcriptScore?: NullableFloatFieldUpdateOperationsInput | number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    concisenessScore?: NullableFloatFieldUpdateOperationsInput | number | null
    technicalDepthScore?: NullableFloatFieldUpdateOperationsInput | number | null
    starMethodScore?: NullableFloatFieldUpdateOperationsInput | number | null
    overallScore?: NullableFloatFieldUpdateOperationsInput | number | null
    enhancedFeedbackGenerated?: BoolFieldUpdateOperationsInput | boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewSessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: NullableStringFieldUpdateOperationsInput | string | null
    interviewType?: NullableStringFieldUpdateOperationsInput | string | null
    jdContext?: NullableStringFieldUpdateOperationsInput | string | null
    openaiSessionId?: NullableStringFieldUpdateOperationsInput | string | null
    fallbackMode?: BoolFieldUpdateOperationsInput | boolean
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    feedbackStatus?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    feedbacks?: FeedbackUpdateManyWithoutSessionNestedInput
    transcripts?: TranscriptUpdateManyWithoutSessionNestedInput
  }

  export type InterviewSessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: NullableStringFieldUpdateOperationsInput | string | null
    interviewType?: NullableStringFieldUpdateOperationsInput | string | null
    jdContext?: NullableStringFieldUpdateOperationsInput | string | null
    openaiSessionId?: NullableStringFieldUpdateOperationsInput | string | null
    fallbackMode?: BoolFieldUpdateOperationsInput | boolean
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    feedbackStatus?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    feedbacks?: FeedbackUncheckedUpdateManyWithoutSessionNestedInput
    transcripts?: TranscriptUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type InterviewSessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    resumeData?: NullableJsonNullValueInput | InputJsonValue
    resumeSnapshot?: NullableJsonNullValueInput | InputJsonValue
    company?: NullableStringFieldUpdateOperationsInput | string | null
    interviewType?: NullableStringFieldUpdateOperationsInput | string | null
    jdContext?: NullableStringFieldUpdateOperationsInput | string | null
    openaiSessionId?: NullableStringFieldUpdateOperationsInput | string | null
    fallbackMode?: BoolFieldUpdateOperationsInput | boolean
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    feedbackStatus?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    audioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UsageEventUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsageEventUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsageEventUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    details?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeedbackCreateManySessionInput = {
    id?: string
    userId: string
    summary: string
    strengths?: string | null
    areasForImprovement?: string | null
    fillerWordCount?: number | null
    transcriptScore?: number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: number | null
    concisenessScore?: number | null
    technicalDepthScore?: number | null
    starMethodScore?: number | null
    overallScore?: number | null
    enhancedFeedbackGenerated?: boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: Date | string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TranscriptCreateManySessionInput = {
    id?: string
    role: string
    content: string
    confidence?: number | null
    timestamp: Date | string
    sequenceNumber?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FeedbackUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    strengths?: NullableStringFieldUpdateOperationsInput | string | null
    areasForImprovement?: NullableStringFieldUpdateOperationsInput | string | null
    fillerWordCount?: NullableIntFieldUpdateOperationsInput | number | null
    transcriptScore?: NullableFloatFieldUpdateOperationsInput | number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    concisenessScore?: NullableFloatFieldUpdateOperationsInput | number | null
    technicalDepthScore?: NullableFloatFieldUpdateOperationsInput | number | null
    starMethodScore?: NullableFloatFieldUpdateOperationsInput | number | null
    overallScore?: NullableFloatFieldUpdateOperationsInput | number | null
    enhancedFeedbackGenerated?: BoolFieldUpdateOperationsInput | boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutFeedbacksNestedInput
  }

  export type FeedbackUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    strengths?: NullableStringFieldUpdateOperationsInput | string | null
    areasForImprovement?: NullableStringFieldUpdateOperationsInput | string | null
    fillerWordCount?: NullableIntFieldUpdateOperationsInput | number | null
    transcriptScore?: NullableFloatFieldUpdateOperationsInput | number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    concisenessScore?: NullableFloatFieldUpdateOperationsInput | number | null
    technicalDepthScore?: NullableFloatFieldUpdateOperationsInput | number | null
    starMethodScore?: NullableFloatFieldUpdateOperationsInput | number | null
    overallScore?: NullableFloatFieldUpdateOperationsInput | number | null
    enhancedFeedbackGenerated?: BoolFieldUpdateOperationsInput | boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeedbackUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    strengths?: NullableStringFieldUpdateOperationsInput | string | null
    areasForImprovement?: NullableStringFieldUpdateOperationsInput | string | null
    fillerWordCount?: NullableIntFieldUpdateOperationsInput | number | null
    transcriptScore?: NullableFloatFieldUpdateOperationsInput | number | null
    structuredData?: NullableJsonNullValueInput | InputJsonValue
    clarityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    concisenessScore?: NullableFloatFieldUpdateOperationsInput | number | null
    technicalDepthScore?: NullableFloatFieldUpdateOperationsInput | number | null
    starMethodScore?: NullableFloatFieldUpdateOperationsInput | number | null
    overallScore?: NullableFloatFieldUpdateOperationsInput | number | null
    enhancedFeedbackGenerated?: BoolFieldUpdateOperationsInput | boolean
    enhancedReportData?: NullableJsonNullValueInput | InputJsonValue
    toneAnalysis?: NullableJsonNullValueInput | InputJsonValue
    keywordRelevanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    sentimentProgression?: NullableJsonNullValueInput | InputJsonValue
    enhancedGeneratedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TranscriptUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    sequenceNumber?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TranscriptUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    sequenceNumber?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TranscriptUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    sequenceNumber?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}