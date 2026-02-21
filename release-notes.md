:robot: I have created a release *beep* *boop*
---


<details><summary>cli: 9.39.0</summary>

## [9.39.0](https://github.com/fagemx/vm0/compare/cli-v9.38.1...cli-v9.39.0) (2026-02-21)


### Features

* add notify-slack preference to gate slack schedule notifications ([#2945](https://github.com/fagemx/vm0/issues/2945)) ([a0058e6](https://github.com/fagemx/vm0/commit/a0058e6d2c2a7f6c4d20c78a287488ba843cce02))
* allow users to set timezone preference for sandbox and scheduling ([#2866](https://github.com/fagemx/vm0/issues/2866)) ([89437c7](https://github.com/fagemx/vm0/commit/89437c733b4e34eee46009b20c99f455c5963289))
* **cli:** add --check-env flag to vm0 run commands ([#2760](https://github.com/fagemx/vm0/issues/2760)) ([f6711e0](https://github.com/fagemx/vm0/commit/f6711e0d047aa872c76f97c8cfaf1257d2f35fb0))
* **cli:** add --json flag and deprecate --porcelain ([#2613](https://github.com/fagemx/vm0/issues/2613)) ([f4fcdb1](https://github.com/fagemx/vm0/commit/f4fcdb19b1766386fc89fc69d0f82901fb06db26))
* **cli:** add --porcelain option to compose command ([#2494](https://github.com/fagemx/vm0/issues/2494)) ([f5f5a3f](https://github.com/fagemx/vm0/commit/f5f5a3fad10cff2a2cc7e962d40062f9c004fd88))
* **cli:** add agent delete command ([#2767](https://github.com/fagemx/vm0/issues/2767)) ([11d555a](https://github.com/fagemx/vm0/commit/11d555ad5432a9893ddc37e55f89a58e7dd5657c))
* **cli:** add auto-pagination to logs command ([#2855](https://github.com/fagemx/vm0/issues/2855)) ([e487a1a](https://github.com/fagemx/vm0/commit/e487a1a687146002f3d7abf2b4904b507b3b29c5))
* **cli:** add computer connector support ([#3124](https://github.com/fagemx/vm0/issues/3124)) ([a950821](https://github.com/fagemx/vm0/commit/a9508213014337b0a4a7effb4756ed7056e3cb0f))
* **cli:** add connector list and disconnect commands ([#2570](https://github.com/fagemx/vm0/issues/2570)) ([aec1120](https://github.com/fagemx/vm0/commit/aec1120600d0ab0709803f643038493ecc6f8bb9))
* **cli:** add connector status command for detailed connector view ([#2582](https://github.com/fagemx/vm0/issues/2582)) ([c342888](https://github.com/fagemx/vm0/commit/c342888a913edb0d7e382bc4b76b91e136decf6b)), closes [#2571](https://github.com/fagemx/vm0/issues/2571)
* **cli:** add dashboard command with guided help ([#2574](https://github.com/fagemx/vm0/issues/2574)) ([4e1d37a](https://github.com/fagemx/vm0/commit/4e1d37ad35046bb8d4cfbcec3e7028415e2339e5))
* **cli:** add filtering options to run list command ([#2646](https://github.com/fagemx/vm0/issues/2646)) ([73c3509](https://github.com/fagemx/vm0/commit/73c3509380b5038eb5b97df6ab50106d41ea7358))
* **cli:** add interactive mode and --body flag for secret set command ([#2441](https://github.com/fagemx/vm0/issues/2441)) ([8d75b85](https://github.com/fagemx/vm0/commit/8d75b85bbe7a2c29b586ac832f040d4c073ee2ce))
* **cli:** enable GitHub URL compose without experimental flag ([#2728](https://github.com/fagemx/vm0/issues/2728)) ([3158138](https://github.com/fagemx/vm0/commit/315813840b9590aca5d5f52575dcb24ddfebbae2)), closes [#2724](https://github.com/fagemx/vm0/issues/2724)
* **cli:** enhance vm0 info command with debug-focused output ([#2643](https://github.com/fagemx/vm0/issues/2643)) ([cc9ed3c](https://github.com/fagemx/vm0/commit/cc9ed3c25fb7f0cc18cadf37b7944fe2720f5808)), closes [#2639](https://github.com/fagemx/vm0/issues/2639)
* **cli:** integrate sentry for error monitoring ([#2416](https://github.com/fagemx/vm0/issues/2416)) ([d6b2937](https://github.com/fagemx/vm0/commit/d6b29374bd6842e6e531b11c207a231cb1bce539))
* **cli:** run auto-upgrade in parallel with command execution ([#2647](https://github.com/fagemx/vm0/issues/2647)) ([cd39243](https://github.com/fagemx/vm0/commit/cd39243dea21768a25b191cb89a7e0c0dae89a49)), closes [#2636](https://github.com/fagemx/vm0/issues/2636)
* **cli:** show connector-derived secret names in secret list ([#2602](https://github.com/fagemx/vm0/issues/2602)) ([877a318](https://github.com/fagemx/vm0/commit/877a31858cf10b7d3d6060d6e10e606c22cd2a83)), closes [#2601](https://github.com/fagemx/vm0/issues/2601)
* **connector:** implement github oauth connector with cli support ([#2446](https://github.com/fagemx/vm0/issues/2446)) ([c12c97a](https://github.com/fagemx/vm0/commit/c12c97a2af0b74d8bdfd452e2cbe7000f9e24f34))
* **email:** add email notifications and reply-to-continue via Resend ([#2836](https://github.com/fagemx/vm0/issues/2836)) ([fd6aa4c](https://github.com/fagemx/vm0/commit/fd6aa4c032a84f25e8c6a8cf4ba4cef5ff070bd9))
* **platform:** add environment variables setup page ([#2737](https://github.com/fagemx/vm0/issues/2737)) ([d33842a](https://github.com/fagemx/vm0/commit/d33842a2e5e72eb5bfebe66cd442135b49f35a51))
* **slack:** send DM notification when scheduled agent run completes ([#2720](https://github.com/fagemx/vm0/issues/2720)) ([77cf47b](https://github.com/fagemx/vm0/commit/77cf47b9911a28394bd0b851d75183ea22764bab))
* **storage:** add optional volume support for graceful degradation ([#2929](https://github.com/fagemx/vm0/issues/2929)) ([fd052a4](https://github.com/fagemx/vm0/commit/fd052a4fef4b2157bb1b1a7a2a0eaccffa6ff262))
* **web:** add server-side github compose api ([#2473](https://github.com/fagemx/vm0/issues/2473)) ([9ab1f23](https://github.com/fagemx/vm0/commit/9ab1f2344f11086fd0f4c30036d04c72fab61b68))


### Bug Fixes

* **ci:** unique runner name per metal host ([#3141](https://github.com/fagemx/vm0/issues/3141)) ([ad5dcf4](https://github.com/fagemx/vm0/commit/ad5dcf49e603392ac476d2e44a033e635756d47b))
* **cli:** add environment and release to sentry config and prevent test leaks ([#2706](https://github.com/fagemx/vm0/issues/2706)) ([56578ad](https://github.com/fagemx/vm0/commit/56578adccbdb20b8299ef0d66e44526d4eaf2a1d))
* **cli:** add error handling to connector connect and display error.cause ([#2682](https://github.com/fagemx/vm0/issues/2682)) ([d19a29e](https://github.com/fagemx/vm0/commit/d19a29e5e2134de5fd7b28bb1ee16467cb6d7046))
* **cli:** add error handling to login command and fix sentry filter ([#2650](https://github.com/fagemx/vm0/issues/2650)) ([8145fab](https://github.com/fagemx/vm0/commit/8145fab77f22cec51dd8b69ec4508d33f440b42c))
* **cli:** add homebrew arm64 path detection for auto-upgrade ([#2648](https://github.com/fagemx/vm0/issues/2648)) ([870c74a](https://github.com/fagemx/vm0/commit/870c74ac3f8aae4cab08adbcea4dcc0c26ae0393)), closes [#2637](https://github.com/fagemx/vm0/issues/2637)
* **cli:** add missing try/catch to auth and cook commands ([#2690](https://github.com/fagemx/vm0/issues/2690)) ([216758d](https://github.com/fagemx/vm0/commit/216758de8f0a860dde5c5b69df9ea15e0eddccb7))
* **cli:** add missing try/catch to onboard command ([#2699](https://github.com/fagemx/vm0/issues/2699)) ([cec0044](https://github.com/fagemx/vm0/commit/cec00445c45b0ce6ff2cc8a5e83191442b85d126))
* **cli:** align error symbols, color semantics, and message formatting with design guideline ([#2615](https://github.com/fagemx/vm0/issues/2615)) ([1e70bc2](https://github.com/fagemx/vm0/commit/1e70bc23b917c9b8f5132b11029941030e17d4c1))
* **cli:** check dependencies before connecting computer connector ([#3146](https://github.com/fagemx/vm0/issues/3146)) ([1e9d814](https://github.com/fagemx/vm0/commit/1e9d814ea5b49fbe687bbab3e6b8357fbdbe7619))
* **cli:** display error.cause for fetch failures and fix onboard auth error handling ([#2669](https://github.com/fagemx/vm0/issues/2669)) ([658e998](https://github.com/fagemx/vm0/commit/658e9985705229cd8500f90c2183f1af8923cad9))
* **cli:** map 401/403 responses to user-friendly error messages ([#2475](https://github.com/fagemx/vm0/issues/2475)) ([ed384fb](https://github.com/fagemx/vm0/commit/ed384fb109c32046335f789f42974261d8c05fec))
* **cli:** map 403 forbidden to user-friendly message in auth flow ([#2673](https://github.com/fagemx/vm0/issues/2673)) ([959d79d](https://github.com/fagemx/vm0/commit/959d79d7a99c91e38a97756f5acccd5045905e1c))
* **cli:** remove client-side env validation from cook command ([#2626](https://github.com/fagemx/vm0/issues/2626)) ([7d8c4c8](https://github.com/fagemx/vm0/commit/7d8c4c890fe96e1ca38f08a7a4dbfa5687997224))
* **cli:** remove session code display from connector connect ([#2569](https://github.com/fagemx/vm0/issues/2569)) ([2a8fae3](https://github.com/fagemx/vm0/commit/2a8fae30b90764d089140fde15cbf3df021c7563))
* **cli:** route error messages and hints to stderr across all commands ([#2614](https://github.com/fagemx/vm0/issues/2614)) ([4d7d406](https://github.com/fagemx/vm0/commit/4d7d406481f86ab39d17333b9ac550b943b6ea8f))
* **cli:** route error messages to stderr in init command ([#2612](https://github.com/fagemx/vm0/issues/2612)) ([93af64e](https://github.com/fagemx/vm0/commit/93af64efbe0c8b891e8387ec21089508c02adcf4))
* **cli:** route error messages to stderr per CLI design guideline ([#2609](https://github.com/fagemx/vm0/issues/2609)) ([a993299](https://github.com/fagemx/vm0/commit/a993299c2705bf945d7309cf5c42148c38cd1a29))
* **cli:** route run-failed output to stderr ([#2610](https://github.com/fagemx/vm0/issues/2610)) ([97e1081](https://github.com/fagemx/vm0/commit/97e1081e72c1b44501450c106e3bb6a94a6abd39))
* **cli:** support repository root GitHub URLs in vm0 compose ([#2427](https://github.com/fagemx/vm0/issues/2427)) ([6c0ba38](https://github.com/fagemx/vm0/commit/6c0ba385bdca8a63d1bff03840d0595150d78cd4)), closes [#2423](https://github.com/fagemx/vm0/issues/2423)
* **cli:** test release-please cli version bump ([#3179](https://github.com/fagemx/vm0/issues/3179)) ([8eb6b9e](https://github.com/fagemx/vm0/commit/8eb6b9e811ac438d2788181fc6f3e5c70890dd53))
* **cli:** use fake timers in usage tests to avoid time-dependent failures ([#3032](https://github.com/fagemx/vm0/issues/3032)) ([9cd34bf](https://github.com/fagemx/vm0/commit/9cd34bfe0a4b7d1ca3fe3f413fca2ab9d7edf6b5))
* **cli:** use nullish coalescing for sentry environment fallback ([#2709](https://github.com/fagemx/vm0/issues/2709)) ([b70248f](https://github.com/fagemx/vm0/commit/b70248fa7e0685091ddbbdd3de2f7a2747df23c8))
* **core:** handle trailing slashes in GitHub URL parsing ([#2459](https://github.com/fagemx/vm0/issues/2459)) ([10226c7](https://github.com/fagemx/vm0/commit/10226c74372cfd3a9e9f08295ad086c41e80acc7)), closes [#2455](https://github.com/fagemx/vm0/issues/2455)
* **dev:** change pre-commit hooks to serial execution ([#2422](https://github.com/fagemx/vm0/issues/2422)) ([2505c13](https://github.com/fagemx/vm0/commit/2505c13d11bb38376b3e6343a051a7814b011a61))
* **e2e:** make agent names unique to prevent compose config collisions ([#3147](https://github.com/fagemx/vm0/issues/3147)) ([022c83f](https://github.com/fagemx/vm0/commit/022c83fcb4dd21135b50964d71f8cac193d42254))
* **e2e:** make secret and variable names unique in t20-schedule test ([#3149](https://github.com/fagemx/vm0/issues/3149)) ([4ef861f](https://github.com/fagemx/vm0/commit/4ef861f72b361bf9a66201f512e58a8d65a40261))
* exclude connector-provided secrets from missing-secrets checks ([#2752](https://github.com/fagemx/vm0/issues/2752)) ([3dc98d4](https://github.com/fagemx/vm0/commit/3dc98d47451a2084b50a9a6ebce2f2ccb31d2833)), closes [#2747](https://github.com/fagemx/vm0/issues/2747)
* **runner:** add path validation and ci hash guards ([#3161](https://github.com/fagemx/vm0/issues/3161)) ([c5313ff](https://github.com/fagemx/vm0/commit/c5313ffdaee030c5fb3d48b950c8d7b6e36e90ae))
* **schedule:** validate secrets/vars against platform tables ([#2558](https://github.com/fagemx/vm0/issues/2558)) ([f19d550](https://github.com/fagemx/vm0/commit/f19d5506e61f16536bf163e5884266d31326fe40))
* **test:** remove vi.unstubAllEnvs from CLI tests and fix compose job race condition ([#2695](https://github.com/fagemx/vm0/issues/2695)) ([04ab29b](https://github.com/fagemx/vm0/commit/04ab29bf89201bb921d6a2f63b9ea4e3f2ab899d))
* **web:** disable json query to fix flaky ambiguous-prefix test ([#2701](https://github.com/fagemx/vm0/issues/2701)) ([a5f8e8a](https://github.com/fagemx/vm0/commit/a5f8e8a375a3a84c46518780201b66f75ea845a3))


### Performance Improvements

* **ci:** deploy runner to all metal hosts in parallel ([#3134](https://github.com/fagemx/vm0/issues/3134)) ([88152d3](https://github.com/fagemx/vm0/commit/88152d30f602490b463ce6049d327c67d21516cb))
* **ci:** increase runner e2e parallelism to 5 per host ([#3135](https://github.com/fagemx/vm0/issues/3135)) ([d81e066](https://github.com/fagemx/vm0/commit/d81e066c9b6b3520ba6a734b0b62bd2ddb030f5f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @vm0/core bumped to 8.19.0
</details>

<details><summary>core: 8.19.0</summary>

## [8.19.0](https://github.com/fagemx/vm0/compare/core-v8.18.0...core-v8.19.0) (2026-02-21)


### Features

* add computer connector api for authenticated local tunneling via ngrok ([#2937](https://github.com/fagemx/vm0/issues/2937)) ([4f3fc4e](https://github.com/fagemx/vm0/commit/4f3fc4ebf137409a30b85b5882634a6bb8846836))
* add gmail connector with nango platform integration ([#3065](https://github.com/fagemx/vm0/issues/3065)) ([d43dfe1](https://github.com/fagemx/vm0/commit/d43dfe1a5a868c8413ffd2b8a250d48dafc791cb))
* add notify-slack preference to gate slack schedule notifications ([#2945](https://github.com/fagemx/vm0/issues/2945)) ([a0058e6](https://github.com/fagemx/vm0/commit/a0058e6d2c2a7f6c4d20c78a287488ba843cce02))
* allow users to set timezone preference for sandbox and scheduling ([#2866](https://github.com/fagemx/vm0/issues/2866)) ([89437c7](https://github.com/fagemx/vm0/commit/89437c733b4e34eee46009b20c99f455c5963289))
* **api:** add backend support for agent detail page ([#2979](https://github.com/fagemx/vm0/issues/2979)) ([4103d8f](https://github.com/fagemx/vm0/commit/4103d8f66ccc9546bccc67454d139b8d1de04599))
* **cli:** add --check-env flag to vm0 run commands ([#2760](https://github.com/fagemx/vm0/issues/2760)) ([f6711e0](https://github.com/fagemx/vm0/commit/f6711e0d047aa872c76f97c8cfaf1257d2f35fb0))
* **cli:** add agent delete command ([#2767](https://github.com/fagemx/vm0/issues/2767)) ([11d555a](https://github.com/fagemx/vm0/commit/11d555ad5432a9893ddc37e55f89a58e7dd5657c))
* **cli:** add computer connector support ([#3124](https://github.com/fagemx/vm0/issues/3124)) ([a950821](https://github.com/fagemx/vm0/commit/a9508213014337b0a4a7effb4756ed7056e3cb0f))
* **cli:** add filtering options to run list command ([#2646](https://github.com/fagemx/vm0/issues/2646)) ([73c3509](https://github.com/fagemx/vm0/commit/73c3509380b5038eb5b97df6ab50106d41ea7358))
* **cli:** show connector-derived secret names in secret list ([#2602](https://github.com/fagemx/vm0/issues/2602)) ([877a318](https://github.com/fagemx/vm0/commit/877a31858cf10b7d3d6060d6e10e606c22cd2a83)), closes [#2601](https://github.com/fagemx/vm0/issues/2601)
* **connector:** implement github oauth connector with cli support ([#2446](https://github.com/fagemx/vm0/issues/2446)) ([c12c97a](https://github.com/fagemx/vm0/commit/c12c97a2af0b74d8bdfd452e2cbe7000f9e24f34))
* **core:** add glm-5 model and fix model id casing ([#2889](https://github.com/fagemx/vm0/issues/2889)) ([f7dff90](https://github.com/fagemx/vm0/commit/f7dff9098110a983c8bf6c15740fa01010f09f5b)), closes [#2883](https://github.com/fagemx/vm0/issues/2883)
* **email:** add email notifications and reply-to-continue via Resend ([#2836](https://github.com/fagemx/vm0/issues/2836)) ([fd6aa4c](https://github.com/fagemx/vm0/commit/fd6aa4c032a84f25e8c6a8cf4ba4cef5ff070bd9))
* **platform:** add agent detail page with feature flag gating ([#2998](https://github.com/fagemx/vm0/issues/2998)) ([5386de0](https://github.com/fagemx/vm0/commit/5386de0662eb2a85e69040788e2ca08e7f976cba))
* **storage:** add optional volume support for graceful degradation ([#2929](https://github.com/fagemx/vm0/issues/2929)) ([fd052a4](https://github.com/fagemx/vm0/commit/fd052a4fef4b2157bb1b1a7a2a0eaccffa6ff262))
* use ngrok reserved domains for computer connector ([#3116](https://github.com/fagemx/vm0/issues/3116)) ([7e30f2c](https://github.com/fagemx/vm0/commit/7e30f2c83f7fb4f82dd0b1e9aed38267ca5919f9))
* **vsock:** add environment variable support to exec/spawn_watch ([#2736](https://github.com/fagemx/vm0/issues/2736)) ([6f93486](https://github.com/fagemx/vm0/commit/6f9348601ae5736e20a8c32a2064ac394a70e70b))
* **web:** add Notion OAuth connector support ([#2738](https://github.com/fagemx/vm0/issues/2738)) ([a201b5d](https://github.com/fagemx/vm0/commit/a201b5d7ffdd081b4a9f299297bad0e06fa890b1))
* **web:** add server-side github compose api ([#2473](https://github.com/fagemx/vm0/issues/2473)) ([9ab1f23](https://github.com/fagemx/vm0/commit/9ab1f2344f11086fd0f4c30036d04c72fab61b68))


### Bug Fixes

* **cli:** support repository root GitHub URLs in vm0 compose ([#2427](https://github.com/fagemx/vm0/issues/2427)) ([6c0ba38](https://github.com/fagemx/vm0/commit/6c0ba385bdca8a63d1bff03840d0595150d78cd4)), closes [#2423](https://github.com/fagemx/vm0/issues/2423)
* **core:** handle trailing slashes in GitHub URL parsing ([#2459](https://github.com/fagemx/vm0/issues/2459)) ([10226c7](https://github.com/fagemx/vm0/commit/10226c74372cfd3a9e9f08295ad086c41e80acc7)), closes [#2455](https://github.com/fagemx/vm0/issues/2455)
* **docs:** update aws bedrock setup guide url ([#2495](https://github.com/fagemx/vm0/issues/2495)) ([8026a4a](https://github.com/fagemx/vm0/commit/8026a4a185ebea25738d580ebe8cda5ea067d59e))
* exclude connector-provided secrets from missing-secrets checks ([#2752](https://github.com/fagemx/vm0/issues/2752)) ([3dc98d4](https://github.com/fagemx/vm0/commit/3dc98d47451a2084b50a9a6ebce2f2ccb31d2833)), closes [#2747](https://github.com/fagemx/vm0/issues/2747)
* remove nango integration and simplify oauth flow ([#3105](https://github.com/fagemx/vm0/issues/3105)) ([a1c601e](https://github.com/fagemx/vm0/commit/a1c601e2217456d16b1e34de0a41fe61a0026e7a))
* **sandbox:** remove prompt content from agent execution logs ([#2653](https://github.com/fagemx/vm0/issues/2653)) ([cfc8b2d](https://github.com/fagemx/vm0/commit/cfc8b2dfecb0120d3e83bb0b7568e0b9916b3414))
* **schedule:** validate secrets/vars against platform tables ([#2558](https://github.com/fagemx/vm0/issues/2558)) ([f19d550](https://github.com/fagemx/vm0/commit/f19d5506e61f16536bf163e5884266d31326fe40))
* **web:** disable json query to fix flaky ambiguous-prefix test ([#2701](https://github.com/fagemx/vm0/issues/2701)) ([a5f8e8a](https://github.com/fagemx/vm0/commit/a5f8e8a375a3a84c46518780201b66f75ea845a3))
* **web:** inject connector secrets into agent execution environment ([#2584](https://github.com/fagemx/vm0/issues/2584)) ([f483b5b](https://github.com/fagemx/vm0/commit/f483b5b0c0c94e45a149f99b8f108c3fc74399a4))
</details>

<details><summary>platform: 0.69.0</summary>

## [0.69.0](https://github.com/fagemx/vm0/compare/platform-v0.68.4...platform-v0.69.0) (2026-02-21)


### Features

* add computer connector api for authenticated local tunneling via ngrok ([#2937](https://github.com/fagemx/vm0/issues/2937)) ([4f3fc4e](https://github.com/fagemx/vm0/commit/4f3fc4ebf137409a30b85b5882634a6bb8846836))
* add dual-mode data provider to sync-env.sh ([#2496](https://github.com/fagemx/vm0/issues/2496)) ([1ccff32](https://github.com/fagemx/vm0/commit/1ccff32ad5cb7feca4d6b16b8ec548c1283295bd))
* add gmail connector with nango platform integration ([#3065](https://github.com/fagemx/vm0/issues/3065)) ([d43dfe1](https://github.com/fagemx/vm0/commit/d43dfe1a5a868c8413ffd2b8a250d48dafc791cb))
* add markdown preview for prompts, slack image hints, and platform tests ([#2991](https://github.com/fagemx/vm0/issues/2991)) ([35da51b](https://github.com/fagemx/vm0/commit/35da51b563330c45444e1cb16b3de566519d2c07))
* **api:** add backend support for agent detail page ([#2979](https://github.com/fagemx/vm0/issues/2979)) ([4103d8f](https://github.com/fagemx/vm0/commit/4103d8f66ccc9546bccc67454d139b8d1de04599))
* **deploy:** add self-hosted deployment support with docker and local auth ([#2718](https://github.com/fagemx/vm0/issues/2718)) ([498da5e](https://github.com/fagemx/vm0/commit/498da5e0a411a034df83c18c00fc287143dc0259))
* improve model provider descriptions and ui ([#2500](https://github.com/fagemx/vm0/issues/2500)) ([435ac6c](https://github.com/fagemx/vm0/commit/435ac6c4b9091578463a55d614dc81975a9924ad))
* owner inline editing for agent instructions ([#3015](https://github.com/fagemx/vm0/issues/3015)) ([e7022c8](https://github.com/fagemx/vm0/commit/e7022c848b7b247ee6f2475c204bfb656588c5ad))
* **platform:** add agent detail page with feature flag gating ([#2998](https://github.com/fagemx/vm0/issues/2998)) ([5386de0](https://github.com/fagemx/vm0/commit/5386de0662eb2a85e69040788e2ca08e7f976cba))
* **platform:** add agent detail routes and shared signals ([#2989](https://github.com/fagemx/vm0/issues/2989)) ([ddf6fca](https://github.com/fagemx/vm0/commit/ddf6fca91c2737231a75b77beca2efb3d9bdc8f4))
* **platform:** add agent logs and connections pages ([#3017](https://github.com/fagemx/vm0/issues/3017)) ([cf943b2](https://github.com/fagemx/vm0/commit/cf943b224b55438152ee67d339c60894709133a8))
* **platform:** add config dialog and run dialog for agent detail page ([#3016](https://github.com/fagemx/vm0/issues/3016)) ([7811f00](https://github.com/fagemx/vm0/commit/7811f0045c022856d283174722cfacf6ced72b7f))
* **platform:** add connector management to settings page ([#2769](https://github.com/fagemx/vm0/issues/2769)) ([418bc1e](https://github.com/fagemx/vm0/commit/418bc1e2dd6afb94b3caca84abf260bf542359c8)), closes [#2766](https://github.com/fagemx/vm0/issues/2766)
* **platform:** add connector-based environment variable setup ([#2847](https://github.com/fagemx/vm0/issues/2847)) ([7a0004f](https://github.com/fagemx/vm0/commit/7a0004f3c0436e53d591f1308b7ec5b59d56f226))
* **platform:** add environment variables setup page ([#2737](https://github.com/fagemx/vm0/issues/2737)) ([d33842a](https://github.com/fagemx/vm0/commit/d33842a2e5e72eb5bfebe66cd442135b49f35a51))
* **platform:** add incremental polling for log detail auto-refresh ([#2716](https://github.com/fagemx/vm0/issues/2716)) ([aad0134](https://github.com/fagemx/vm0/commit/aad0134608f0d8af1f55bbe6cda6bcac8972d451))
* **platform:** add lint rule enforcing render mode in tests ([#2802](https://github.com/fagemx/vm0/issues/2802)) ([2c8de3b](https://github.com/fagemx/vm0/commit/2c8de3b70741f74ea56c17c3f64cdb1f974d7965))
* **platform:** add secret/variable settings page with tabs and url deep-linking ([#2624](https://github.com/fagemx/vm0/issues/2624)) ([dac5bad](https://github.com/fagemx/vm0/commit/dac5badf4773b7602ceca837a224eb58220f4b5e))
* **platform:** collapse consecutive same-type tool calls in log detail ([#2560](https://github.com/fagemx/vm0/issues/2560)) ([71091bc](https://github.com/fagemx/vm0/commit/71091bc1599fcfde7b1894563731ade9dbd9a680))
* **platform:** detect and display missing secrets for agents ([#2664](https://github.com/fagemx/vm0/issues/2664)) ([e43fb63](https://github.com/fagemx/vm0/commit/e43fb63d574f3f614254e702c76270b59381fedf))
* **platform:** display user prompt in log detail page ([#2535](https://github.com/fagemx/vm0/issues/2535)) ([80d1d37](https://github.com/fagemx/vm0/commit/80d1d37c6beefbf436ccacf0543e561981defee4))
* **platform:** improve mobile responsiveness and ux ([#2616](https://github.com/fagemx/vm0/issues/2616)) ([aa0dad0](https://github.com/fagemx/vm0/commit/aa0dad03aa4b89a2d4cd8e914226482247bc39ac))
* **platform:** make agents table rows fully clickable ([#2438](https://github.com/fagemx/vm0/issues/2438)) ([5771131](https://github.com/fagemx/vm0/commit/5771131b92ddde046e28b06e4e403b48ae047a0c))
* **platform:** model provider settings page with full CRUD management ([#2469](https://github.com/fagemx/vm0/issues/2469)) ([0f9fd01](https://github.com/fagemx/vm0/commit/0f9fd01a574011c940c1b4d1653fa76161a2c7f3))
* **platform:** optimize logs page navigation for instant feedback ([#2577](https://github.com/fagemx/vm0/issues/2577)) ([f874e37](https://github.com/fagemx/vm0/commit/f874e375b8091c9fe006c021d307021a5d161995))
* **platform:** polish logs page ui with skeletons and refined copy ([#2428](https://github.com/fagemx/vm0/issues/2428)) ([0050775](https://github.com/fagemx/vm0/commit/005077591a8bdc9891f2b9e7745553514f74a29c))
* **settings:** improve ui consistency and add success notifications ([#2976](https://github.com/fagemx/vm0/issues/2976)) ([6418997](https://github.com/fagemx/vm0/commit/6418997a206901e7739c6398c9129474449c0e66))
* **slack:** move settings to platform integrations page ([#2797](https://github.com/fagemx/vm0/issues/2797)) ([030e41f](https://github.com/fagemx/vm0/commit/030e41fa55e7f7eeebb811f6619ad84c954de173))
* **slack:** redirect to provider setup after connect ([#2854](https://github.com/fagemx/vm0/issues/2854)) ([3701bf6](https://github.com/fagemx/vm0/commit/3701bf66ad61c8d2ed525e2f97547cfa4bca8d82))
* **web:** handle agent timeout with user notification in Slack threads ([#2563](https://github.com/fagemx/vm0/issues/2563)) ([00456d8](https://github.com/fagemx/vm0/commit/00456d841dde7fed7e848cbab41bb6236c34ffe7))


### Bug Fixes

* **ci:** update platform deployment to use unified clerk env var ([#2502](https://github.com/fagemx/vm0/issues/2502)) ([f63ae57](https://github.com/fagemx/vm0/commit/f63ae575aff0b7d4549abdf141af5ebe05086a7d))
* hide connect button while polling ([#3107](https://github.com/fagemx/vm0/issues/3107)) ([be3af5d](https://github.com/fagemx/vm0/commit/be3af5da3a372d5f110410279e10db860dfabf75))
* **platform:** connector setup improvements and trailing ? fix ([#2857](https://github.com/fagemx/vm0/issues/2857)) ([5f65661](https://github.com/fagemx/vm0/commit/5f656610669ccc9999d709f0b8f06f6f15f4ef49))
* **platform:** display actual model provider name in agents table ([#2524](https://github.com/fagemx/vm0/issues/2524)) ([99e3791](https://github.com/fagemx/vm0/commit/99e379185ea2ea0caf6d727c8ad065a232fd1ce6))
* **platform:** enforce MSW onUnhandledRequest error mode ([#2791](https://github.com/fagemx/vm0/issues/2791)) ([ce092a5](https://github.com/fagemx/vm0/commit/ce092a514d198fef5cb90b0ae72818c874c2a383))
* **platform:** fix agents page missing vars, connector suggestions, and stale state ([#2946](https://github.com/fagemx/vm0/issues/2946)) ([b20addf](https://github.com/fagemx/vm0/commit/b20addf0266a0326ee5f263d54ba299f7e71546e))
* **platform:** fix bash error overflow and markdown table light mode ([#2891](https://github.com/fagemx/vm0/issues/2891)) ([98c89fd](https://github.com/fagemx/vm0/commit/98c89fd53acfe601bc818b1b48b5d67e30676374))
* **platform:** improve environment-variables-setup connector UI ([#2932](https://github.com/fagemx/vm0/issues/2932)) ([fbc02b1](https://github.com/fagemx/vm0/commit/fbc02b16f832ee35fe914210f5cd1224737bf973))
* **platform:** improve onboarding modal layout and scrolling ([#2521](https://github.com/fagemx/vm0/issues/2521)) ([bbfe6aa](https://github.com/fagemx/vm0/commit/bbfe6aac1a10d3c7bee54a28fb9d6028a0d52985))
* **platform:** persist model selection for providers with predefined models ([#2925](https://github.com/fagemx/vm0/issues/2925)) ([cf014c0](https://github.com/fagemx/vm0/commit/cf014c0a6c4a439748251023937b97f5d60dcf6c)), closes [#2923](https://github.com/fagemx/vm0/issues/2923)
* **platform:** prevent layout overlap in logs detail page on mobile ([#2418](https://github.com/fagemx/vm0/issues/2418)) ([5c732bb](https://github.com/fagemx/vm0/commit/5c732bb3ec23cf31caaefd1c4ac65f149332bc95))
* **platform:** show skeleton loading state instead of flashing empty state in secrets/vars lists ([#2840](https://github.com/fagemx/vm0/issues/2840)) ([cab7682](https://github.com/fagemx/vm0/commit/cab7682483252324f0d4e14dfa07b67fceb5ac0a)), closes [#2658](https://github.com/fagemx/vm0/issues/2658)
* **platform:** show workspace agent in slack settings when not owned by user ([#2918](https://github.com/fagemx/vm0/issues/2918)) ([07f5451](https://github.com/fagemx/vm0/commit/07f54516e32bca44c3fa61cff0b696a390cf741c))
* **platform:** sort events by sequenceNumber before grouping to fix unknown tool results ([#2556](https://github.com/fagemx/vm0/issues/2556)) ([430ddcb](https://github.com/fagemx/vm0/commit/430ddcbb99daf813617e68b4c38d821454cb62d8)), closes [#2549](https://github.com/fagemx/vm0/issues/2549)
* **platform:** use simple box icon for collapsed sidebar logo ([#2623](https://github.com/fagemx/vm0/issues/2623)) ([1b26059](https://github.com/fagemx/vm0/commit/1b26059ce80ceec9ce1b282249334d30b9554c9a))
* **platform:** wrap error messages to prevent horizontal scroll ([#2454](https://github.com/fagemx/vm0/issues/2454)) ([2391be6](https://github.com/fagemx/vm0/commit/2391be6cd22ecca8e9c6cdeba04df72b971cf667)), closes [#2450](https://github.com/fagemx/vm0/issues/2450)
* remove nango integration and simplify oauth flow ([#3105](https://github.com/fagemx/vm0/issues/3105)) ([a1c601e](https://github.com/fagemx/vm0/commit/a1c601e2217456d16b1e34de0a41fe61a0026e7a))
* sanitize mock data and rename platform env var ([#2912](https://github.com/fagemx/vm0/issues/2912)) ([b56b513](https://github.com/fagemx/vm0/commit/b56b513076eddc3d25b4e106e005b2ab9bc4f518))


### Performance Improvements

* **platform:** skip rendering in signal-only tests ([#2798](https://github.com/fagemx/vm0/issues/2798)) ([e438809](https://github.com/fagemx/vm0/commit/e4388091362b0e7812ea859c9a085061a99a6acf))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @vm0/core bumped to 8.19.0
</details>

<details><summary>runner: 3.20.0</summary>

## [3.20.0](https://github.com/fagemx/vm0/compare/runner-v3.19.6...runner-v3.20.0) (2026-02-21)


### Features

* **cli:** add --porcelain option to compose command ([#2494](https://github.com/fagemx/vm0/issues/2494)) ([f5f5a3f](https://github.com/fagemx/vm0/commit/f5f5a3fad10cff2a2cc7e962d40062f9c004fd88))
* **guest-agent:** implement rust guest-agent crate ([#2759](https://github.com/fagemx/vm0/issues/2759)) ([8a91042](https://github.com/fagemx/vm0/commit/8a910429b6adb47c86659638e69f5a6d024e4851))
* **guest-mock-claude:** add rust mock-claude binary for firecracker vms ([#2783](https://github.com/fagemx/vm0/issues/2783)) ([d06b37a](https://github.com/fagemx/vm0/commit/d06b37a3c19449f049c83cf32b690bf40c6f77a5))
* **runner:** add vm-common and vm-download rust crates ([#2463](https://github.com/fagemx/vm0/issues/2463)) ([d463ed1](https://github.com/fagemx/vm0/commit/d463ed1766b8c18325e21804e01fcd0e9ed747e8))
* **vsock:** add environment variable support to exec/spawn_watch ([#2736](https://github.com/fagemx/vm0/issues/2736)) ([6f93486](https://github.com/fagemx/vm0/commit/6f9348601ae5736e20a8c32a2064ac394a70e70b))
* **vsock:** add sudo flag to exec/spawn_watch protocol ([#2985](https://github.com/fagemx/vm0/issues/2985)) ([9c42331](https://github.com/fagemx/vm0/commit/9c423314a07f8de0f1b92ea3adca4efa4c6de987)), closes [#2984](https://github.com/fagemx/vm0/issues/2984)


### Bug Fixes

* **guest-download:** only treat 404 as non-fatal for artifact downloads ([#2900](https://github.com/fagemx/vm0/issues/2900)) ([8711a0f](https://github.com/fagemx/vm0/commit/8711a0f5cfad3ac0fa8eda31ff74d48e3fbcde6e))
* **runner:** make runner sole reporter of job completion ([#2852](https://github.com/fagemx/vm0/issues/2852)) ([807e2f9](https://github.com/fagemx/vm0/commit/807e2f9489ff4780eb3ff235d0eac2baae1b37d1))
* **vsock-guest:** handle echild race with pid 1 zombie reaper ([#3118](https://github.com/fagemx/vm0/issues/3118)) ([985f349](https://github.com/fagemx/vm0/commit/985f349134b981d6123fe26ee79f991ec56ceb59))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @vm0/core bumped to 8.19.0
</details>

<details><summary>docs: 2.14.0</summary>

## [2.14.0](https://github.com/fagemx/vm0/compare/docs-v2.13.0...docs-v2.14.0) (2026-02-21)


### Features

* **docs:** add ecosystem section with slack integration guide ([#2635](https://github.com/fagemx/vm0/issues/2635)) ([3a0d45a](https://github.com/fagemx/vm0/commit/3a0d45a84e8bc834bb409d39d109e2dd7ef3a844))
* **docs:** update slack docs and rename ecosystem to integrations ([#2917](https://github.com/fagemx/vm0/issues/2917)) ([fe90cd9](https://github.com/fagemx/vm0/commit/fe90cd90aa92291fd3f277ca324dd9f43d76b6ac))
* **self-host:** add docker compose setup ([#2853](https://github.com/fagemx/vm0/issues/2853)) ([bd757fd](https://github.com/fagemx/vm0/commit/bd757fd21385dca449e82f6880bc5265dcf1b80d))


### Bug Fixes

* **docs:** update aws bedrock setup guide url ([#2495](https://github.com/fagemx/vm0/issues/2495)) ([8026a4a](https://github.com/fagemx/vm0/commit/8026a4a185ebea25738d580ebe8cda5ea067d59e))
</details>

<details><summary>web: 12.46.0</summary>

## [12.46.0](https://github.com/fagemx/vm0/compare/web-v12.45.0...web-v12.46.0) (2026-02-21)


### Features

* add computer connector api for authenticated local tunneling via ngrok ([#2937](https://github.com/fagemx/vm0/issues/2937)) ([4f3fc4e](https://github.com/fagemx/vm0/commit/4f3fc4ebf137409a30b85b5882634a6bb8846836))
* add gmail connector with nango platform integration ([#3065](https://github.com/fagemx/vm0/issues/3065)) ([d43dfe1](https://github.com/fagemx/vm0/commit/d43dfe1a5a868c8413ffd2b8a250d48dafc791cb))
* add markdown preview for prompts, slack image hints, and platform tests ([#2991](https://github.com/fagemx/vm0/issues/2991)) ([35da51b](https://github.com/fagemx/vm0/commit/35da51b563330c45444e1cb16b3de566519d2c07))
* add notify-slack preference to gate slack schedule notifications ([#2945](https://github.com/fagemx/vm0/issues/2945)) ([a0058e6](https://github.com/fagemx/vm0/commit/a0058e6d2c2a7f6c4d20c78a287488ba843cce02))
* add webhook callback mechanism for agent run completion ([#2829](https://github.com/fagemx/vm0/issues/2829)) ([6069b7c](https://github.com/fagemx/vm0/commit/6069b7c6c99bc8bda79f214e10df5d2590ef5fad))
* allow users to set timezone preference for sandbox and scheduling ([#2866](https://github.com/fagemx/vm0/issues/2866)) ([89437c7](https://github.com/fagemx/vm0/commit/89437c733b4e34eee46009b20c99f455c5963289))
* **api:** add backend support for agent detail page ([#2979](https://github.com/fagemx/vm0/issues/2979)) ([4103d8f](https://github.com/fagemx/vm0/commit/4103d8f66ccc9546bccc67454d139b8d1de04599))
* **api:** include email-shared agents in agent list endpoints ([#2941](https://github.com/fagemx/vm0/issues/2941)) ([1687a74](https://github.com/fagemx/vm0/commit/1687a7453b1fa796b85327f959cbfefe1f3f9ee4))
* **cli:** add --check-env flag to vm0 run commands ([#2760](https://github.com/fagemx/vm0/issues/2760)) ([f6711e0](https://github.com/fagemx/vm0/commit/f6711e0d047aa872c76f97c8cfaf1257d2f35fb0))
* **cli:** add --porcelain option to compose command ([#2494](https://github.com/fagemx/vm0/issues/2494)) ([f5f5a3f](https://github.com/fagemx/vm0/commit/f5f5a3fad10cff2a2cc7e962d40062f9c004fd88))
* **cli:** add agent delete command ([#2767](https://github.com/fagemx/vm0/issues/2767)) ([11d555a](https://github.com/fagemx/vm0/commit/11d555ad5432a9893ddc37e55f89a58e7dd5657c))
* **cli:** add computer connector support ([#3124](https://github.com/fagemx/vm0/issues/3124)) ([a950821](https://github.com/fagemx/vm0/commit/a9508213014337b0a4a7effb4756ed7056e3cb0f))
* **cli:** add filtering options to run list command ([#2646](https://github.com/fagemx/vm0/issues/2646)) ([73c3509](https://github.com/fagemx/vm0/commit/73c3509380b5038eb5b97df6ab50106d41ea7358))
* **connector:** implement github oauth connector with cli support ([#2446](https://github.com/fagemx/vm0/issues/2446)) ([c12c97a](https://github.com/fagemx/vm0/commit/c12c97a2af0b74d8bdfd452e2cbe7000f9e24f34))
* **deploy:** add self-hosted deployment support with docker and local auth ([#2718](https://github.com/fagemx/vm0/issues/2718)) ([498da5e](https://github.com/fagemx/vm0/commit/498da5e0a411a034df83c18c00fc287143dc0259))
* **docs:** update slack docs and rename ecosystem to integrations ([#2917](https://github.com/fagemx/vm0/issues/2917)) ([fe90cd9](https://github.com/fagemx/vm0/commit/fe90cd90aa92291fd3f277ca324dd9f43d76b6ac))
* **email:** add email notifications and reply-to-continue via Resend ([#2836](https://github.com/fagemx/vm0/issues/2836)) ([fd6aa4c](https://github.com/fagemx/vm0/commit/fd6aa4c032a84f25e8c6a8cf4ba4cef5ff070bd9))
* **email:** add vm0 branding to scheduled run notifications ([#2949](https://github.com/fagemx/vm0/issues/2949)) ([db03c4a](https://github.com/fagemx/vm0/commit/db03c4af4c67cb25c57163238e241a76a5e67348))
* improve banner and navbar design ([#2478](https://github.com/fagemx/vm0/issues/2478)) ([e028418](https://github.com/fagemx/vm0/commit/e0284187c6e00e999d26863c7578c933c8e91f8a))
* owner inline editing for agent instructions ([#3015](https://github.com/fagemx/vm0/issues/3015)) ([e7022c8](https://github.com/fagemx/vm0/commit/e7022c848b7b247ee6f2475c204bfb656588c5ad))
* **platform:** add agent detail page with feature flag gating ([#2998](https://github.com/fagemx/vm0/issues/2998)) ([5386de0](https://github.com/fagemx/vm0/commit/5386de0662eb2a85e69040788e2ca08e7f976cba))
* **platform:** add config dialog and run dialog for agent detail page ([#3016](https://github.com/fagemx/vm0/issues/3016)) ([7811f00](https://github.com/fagemx/vm0/commit/7811f0045c022856d283174722cfacf6ced72b7f))
* **platform:** add connector management to settings page ([#2769](https://github.com/fagemx/vm0/issues/2769)) ([418bc1e](https://github.com/fagemx/vm0/commit/418bc1e2dd6afb94b3caca84abf260bf542359c8)), closes [#2766](https://github.com/fagemx/vm0/issues/2766)
* **platform:** add secret/variable settings page with tabs and url deep-linking ([#2624](https://github.com/fagemx/vm0/issues/2624)) ([dac5bad](https://github.com/fagemx/vm0/commit/dac5badf4773b7602ceca837a224eb58220f4b5e))
* **platform:** detect and display missing secrets for agents ([#2664](https://github.com/fagemx/vm0/issues/2664)) ([e43fb63](https://github.com/fagemx/vm0/commit/e43fb63d574f3f614254e702c76270b59381fedf))
* **platform:** improve mobile responsiveness and ux ([#2616](https://github.com/fagemx/vm0/issues/2616)) ([aa0dad0](https://github.com/fagemx/vm0/commit/aa0dad03aa4b89a2d4cd8e914226482247bc39ac))
* **self-host:** add docker compose setup ([#2853](https://github.com/fagemx/vm0/issues/2853)) ([bd757fd](https://github.com/fagemx/vm0/commit/bd757fd21385dca449e82f6880bc5265dcf1b80d))
* simplify environment variable naming ([#3047](https://github.com/fagemx/vm0/issues/3047)) ([609ba7d](https://github.com/fagemx/vm0/commit/609ba7d35985e905f6e198275e0ab862313deafe))
* simplify environment variable naming ([#3050](https://github.com/fagemx/vm0/issues/3050)) ([9241e1f](https://github.com/fagemx/vm0/commit/9241e1fc28e12024fad37e27334c79569fd69665))
* **slack:** add app home tab, welcome message, and DM improvements ([#2554](https://github.com/fagemx/vm0/issues/2554)) ([131b380](https://github.com/fagemx/vm0/commit/131b3807e6b056e71717c5b7e1e36ca3c04ed14f))
* **slack:** add compose agent button to app home ([#2751](https://github.com/fagemx/vm0/issues/2751)) ([f5ee9e5](https://github.com/fagemx/vm0/commit/f5ee9e57f03b7c5db669480923f019a3a7875e8e))
* **slack:** add direct message chat capability ([#2489](https://github.com/fagemx/vm0/issues/2489)) ([b5a01bf](https://github.com/fagemx/vm0/commit/b5a01bfb927d360b73bbf28b5e9e370cdb5127ce))
* **slack:** add documentation link to app home and help command ([#2744](https://github.com/fagemx/vm0/issues/2744)) ([17145af](https://github.com/fagemx/vm0/commit/17145af4512ad4181a7d368bc1b8d931fbf46355))
* **slack:** allow composing agents from github in agent link command ([#2567](https://github.com/fagemx/vm0/issues/2567)) ([66ea133](https://github.com/fagemx/vm0/commit/66ea13371e3b28525e82019a483d8503d6cdd8dc))
* **slack:** auto-setup scope, model provider check, and artifact during link flow ([#2697](https://github.com/fagemx/vm0/issues/2697)) ([846f90d](https://github.com/fagemx/vm0/commit/846f90d652a63bb9c1487768f79cf637f9fa3798))
* **slack:** deduplicate context messages across thread turns ([#2641](https://github.com/fagemx/vm0/issues/2641)) ([f0159cb](https://github.com/fagemx/vm0/commit/f0159cbccb96089a6379735617836ca930a247ca))
* **slack:** display user email instead of user ID on app home page ([#2618](https://github.com/fagemx/vm0/issues/2618)) ([5963097](https://github.com/fagemx/vm0/commit/5963097e89ded2dd8b76b562dc03ef210c2db494))
* **slack:** extract /vm0 agent compose as standalone command ([#2638](https://github.com/fagemx/vm0/issues/2638)) ([bb0ee22](https://github.com/fagemx/vm0/commit/bb0ee22df4d72a0e4cd09c06f51f975c56eefc12))
* **slack:** move settings to platform integrations page ([#2797](https://github.com/fagemx/vm0/issues/2797)) ([030e41f](https://github.com/fagemx/vm0/commit/030e41fa55e7f7eeebb811f6619ad84c954de173))
* **slack:** redesign to per-workspace single-agent model ([#2772](https://github.com/fagemx/vm0/issues/2772)) ([58f2b94](https://github.com/fagemx/vm0/commit/58f2b94b8c6220a5c87de3ecc13bca5eae60dd08))
* **slack:** redirect to provider setup after connect ([#2854](https://github.com/fagemx/vm0/issues/2854)) ([3701bf6](https://github.com/fagemx/vm0/commit/3701bf66ad61c8d2ed525e2f97547cfa4bca8d82))
* **slack:** send DM notification when scheduled agent run completes ([#2720](https://github.com/fagemx/vm0/issues/2720)) ([77cf47b](https://github.com/fagemx/vm0/commit/77cf47b9911a28394bd0b851d75183ea22764bab))
* **slack:** surface permission-denied questions in agent run output ([#2482](https://github.com/fagemx/vm0/issues/2482)) ([1e5ecda](https://github.com/fagemx/vm0/commit/1e5ecda944d3f5849c596a49bedafb81563c5ad7))
* **storage:** add optional volume support for graceful degradation ([#2929](https://github.com/fagemx/vm0/issues/2929)) ([fd052a4](https://github.com/fagemx/vm0/commit/fd052a4fef4b2157bb1b1a7a2a0eaccffa6ff262))
* use ngrok reserved domains for computer connector ([#3116](https://github.com/fagemx/vm0/issues/3116)) ([7e30f2c](https://github.com/fagemx/vm0/commit/7e30f2c83f7fb4f82dd0b1e9aed38267ca5919f9))
* **web:** add blog public routes and fix list styling ([#2472](https://github.com/fagemx/vm0/issues/2472)) ([c93aa30](https://github.com/fagemx/vm0/commit/c93aa30ca65ce37982ff7129cc2616eba722f4ab))
* **web:** add db:reset script for local development ([#2676](https://github.com/fagemx/vm0/issues/2676)) ([2dd6429](https://github.com/fagemx/vm0/commit/2dd64297c5982da0f7d4c02a4726f82e49630619))
* **web:** add eslint rule to detect duplicate migration prefixes ([#2845](https://github.com/fagemx/vm0/issues/2845)) ([7fcd801](https://github.com/fagemx/vm0/commit/7fcd801491b0e9bd2dd29caa6b4472ae03c93cb1))
* **web:** add eslint rule to forbid relative paths in vi.mock() ([#2748](https://github.com/fagemx/vm0/issues/2748)) ([d909568](https://github.com/fagemx/vm0/commit/d9095686a9060da19ef6f61a6355c0a9d5459c75))
* **web:** add eslint rule to prevent direct db access in tests ([#2470](https://github.com/fagemx/vm0/issues/2470)) ([da6c435](https://github.com/fagemx/vm0/commit/da6c435fdba3686380720bfc25db4fc4c538fc6f))
* **web:** add keyword detection for slack agent responses with deep links ([#3003](https://github.com/fagemx/vm0/issues/3003)) ([24adaff](https://github.com/fagemx/vm0/commit/24adaffd619e65a692eb643a4dec25d8cb6f457c)), closes [#2995](https://github.com/fagemx/vm0/issues/2995)
* **web:** add migration consistency testing ([#3066](https://github.com/fagemx/vm0/issues/3066)) ([cef8348](https://github.com/fagemx/vm0/commit/cef83484f87bfceacf03f1bfd185be49504080da))
* **web:** add Notion OAuth connector support ([#2738](https://github.com/fagemx/vm0/issues/2738)) ([a201b5d](https://github.com/fagemx/vm0/commit/a201b5d7ffdd081b4a9f299297bad0e06fa890b1))
* **web:** add per-user cloud endpoint with traffic policy for computer connector ([#3019](https://github.com/fagemx/vm0/issues/3019)) ([24e8154](https://github.com/fagemx/vm0/commit/24e81542baffb2efe15c2633a34e808c37ab2a92))
* **web:** add server-side github compose api ([#2473](https://github.com/fagemx/vm0/issues/2473)) ([9ab1f23](https://github.com/fagemx/vm0/commit/9ab1f2344f11086fd0f4c30036d04c72fab61b68))
* **web:** add usage_daily aggregation with dual-path on-demand caching ([#2587](https://github.com/fagemx/vm0/issues/2587)) ([5fbacc5](https://github.com/fagemx/vm0/commit/5fbacc5e68c93c5445c40ab98f6ed59c982663be))
* **web:** handle agent timeout with user notification in Slack threads ([#2563](https://github.com/fagemx/vm0/issues/2563)) ([00456d8](https://github.com/fagemx/vm0/commit/00456d841dde7fed7e848cbab41bb6236c34ffe7))
* **web:** load author avatars from strapi in blog ([#2474](https://github.com/fagemx/vm0/issues/2474)) ([d490cfa](https://github.com/fagemx/vm0/commit/d490cfac7635c38fcb95cb64fc42def47b92208c))
* **web:** split axiom token into scoped tokens for least-privilege access ([#2578](https://github.com/fagemx/vm0/issues/2578)) ([bb8eded](https://github.com/fagemx/vm0/commit/bb8ededd238e504cf9ccf79867205d115259aec2)), closes [#2564](https://github.com/fagemx/vm0/issues/2564)


### Bug Fixes

* **api:** preserve slack admin and default agent on workspace re-install ([#2963](https://github.com/fagemx/vm0/issues/2963)) ([d8f26b2](https://github.com/fagemx/vm0/commit/d8f26b2e9146fd0923f88c7f082c2c117dfc5a79))
* **db:** register orphaned migration 0077 as 0079 in journal ([#2785](https://github.com/fagemx/vm0/issues/2785)) ([7a5e013](https://github.com/fagemx/vm0/commit/7a5e01395c083b497b38ff3c1b36a3a15b0c6828))
* **email:** align reply subject with schedule notification for threading ([#2952](https://github.com/fagemx/vm0/issues/2952)) ([b70c814](https://github.com/fagemx/vm0/commit/b70c8149847e70ab831ea2e7f502d6efcdda1711))
* enable parallel test execution in web app ([#2865](https://github.com/fagemx/vm0/issues/2865)) ([0c04ef0](https://github.com/fagemx/vm0/commit/0c04ef08066bf2854b43029b862a48511cce2ccb))
* ensure after() awaits callback dispatch promise ([#2902](https://github.com/fagemx/vm0/issues/2902)) ([d62c92f](https://github.com/fagemx/vm0/commit/d62c92fcbcf0f7ac330493a6a8be1d52f8643d26))
* exclude connector-provided secrets from missing-secrets checks ([#2752](https://github.com/fagemx/vm0/issues/2752)) ([3dc98d4](https://github.com/fagemx/vm0/commit/3dc98d47451a2084b50a9a6ebce2f2ccb31d2833)), closes [#2747](https://github.com/fagemx/vm0/issues/2747)
* improve validation error handler robustness ([#3114](https://github.com/fagemx/vm0/issues/3114)) ([6506d06](https://github.com/fagemx/vm0/commit/6506d066ab5dd01c4c33a3f1e6dbe6241ac662cb))
* **platform:** fix bash error overflow and markdown table light mode ([#2891](https://github.com/fagemx/vm0/issues/2891)) ([98c89fd](https://github.com/fagemx/vm0/commit/98c89fd53acfe601bc818b1b48b5d67e30676374))
* prevent env validation errors on client side ([#3059](https://github.com/fagemx/vm0/issues/3059)) ([886bd66](https://github.com/fagemx/vm0/commit/886bd663b062ec515d59821663d21011f83b391e))
* **schedule:** validate secrets/vars against platform tables ([#2558](https://github.com/fagemx/vm0/issues/2558)) ([f19d550](https://github.com/fagemx/vm0/commit/f19d5506e61f16536bf163e5884266d31326fe40))
* **site:** override canonical URL on blog pages to fix Safari sharing ([#2512](https://github.com/fagemx/vm0/issues/2512)) ([7dedcd0](https://github.com/fagemx/vm0/commit/7dedcd0981e49dd665ce94c1e542082733d7f7df))
* **slack:** add artifact name to create-run call in slack agent handler ([#2955](https://github.com/fagemx/vm0/issues/2955)) ([e12262d](https://github.com/fagemx/vm0/commit/e12262d261237b4742160ceb0e00f7291984cf5c))
* **slack:** download and upload images to R2 for Claude Code access ([#2413](https://github.com/fagemx/vm0/issues/2413)) ([eda84dc](https://github.com/fagemx/vm0/commit/eda84dc6065a66f0aa70c925323933fc80a12579))
* **slack:** return caddy proxy address for platform in dev environment ([#2687](https://github.com/fagemx/vm0/issues/2687)) ([d2fa6e4](https://github.com/fagemx/vm0/commit/d2fa6e4c278dc021b490087c505ca43e7beea603))
* **slack:** sync agent permissions when admin switches workspace agent ([#3024](https://github.com/fagemx/vm0/issues/3024)) ([dbdafec](https://github.com/fagemx/vm0/commit/dbdafeca2ba2483841ac0606d5216a45198f3c4d))
* **slack:** update command naming and auto-configure dev environment ([#2424](https://github.com/fagemx/vm0/issues/2424)) ([a684bfe](https://github.com/fagemx/vm0/commit/a684bfe99b362a8677d2075d9fc67a06fb0a8704))
* **slack:** use most recent workspace link for settings api ([#2928](https://github.com/fagemx/vm0/issues/2928)) ([53513d1](https://github.com/fagemx/vm0/commit/53513d18d9817254a2f6869c6283fa3e618168f6))
* **slack:** use session's compose when continuing conversation ([#2934](https://github.com/fagemx/vm0/issues/2934)) ([ca19a82](https://github.com/fagemx/vm0/commit/ca19a8266cad225d4e8f3f726f49d3cd66c074e6))
* **telemetry:** await db fallback instead of fire-and-forget ([#2841](https://github.com/fagemx/vm0/issues/2841)) ([7dbabc0](https://github.com/fagemx/vm0/commit/7dbabc0cdb6c34e1a221d0353aa77b1405e15e03))
* **test:** remove vi.unstubAllEnvs from CLI tests and fix compose job race condition ([#2695](https://github.com/fagemx/vm0/issues/2695)) ([04ab29b](https://github.com/fagemx/vm0/commit/04ab29bf89201bb921d6a2f63b9ea4e3f2ab899d))
* **web:** add api url fallback for compose job webhooks ([#2553](https://github.com/fagemx/vm0/issues/2553)) ([361e3b7](https://github.com/fagemx/vm0/commit/361e3b799d529d02a7c2e6082f13723d5262bd81)), closes [#2550](https://github.com/fagemx/vm0/issues/2550)
* **web:** add missing job ID filter in cleanup-compose-jobs cron WHERE clause ([#2534](https://github.com/fagemx/vm0/issues/2534)) ([f6bea80](https://github.com/fagemx/vm0/commit/f6bea803423da0527386e0a890a245757d949d0f))
* **web:** add pointer-events-none to auth page overlays and fix otp input styles ([#2683](https://github.com/fagemx/vm0/issues/2683)) ([aca61f1](https://github.com/fagemx/vm0/commit/aca61f16767942d6bd9b5ab4922bd5d22ae258e7))
* **web:** disable json query to fix flaky ambiguous-prefix test ([#2701](https://github.com/fagemx/vm0/issues/2701)) ([a5f8e8a](https://github.com/fagemx/vm0/commit/a5f8e8a375a3a84c46518780201b66f75ea845a3))
* **web:** ensure platform url is available in client components ([#2873](https://github.com/fagemx/vm0/issues/2873)) ([b16f8f9](https://github.com/fagemx/vm0/commit/b16f8f93dc7c7487681a214050e874dbe3e898d3))
* **web:** exclude stale pending runs from concurrency check ([#2445](https://github.com/fagemx/vm0/issues/2445)) ([0dc7427](https://github.com/fagemx/vm0/commit/0dc7427a10d4faa382d771664a09b1b0739231c6))
* **web:** fix drizzle-kit generate partial indexes ([#3062](https://github.com/fagemx/vm0/issues/3062)) ([96eca9b](https://github.com/fagemx/vm0/commit/96eca9b8b8ee8074f78f43d9fe08761ed4bfe6d4))
* **web:** improve responsive padding for landing page cards ([#2573](https://github.com/fagemx/vm0/issues/2573)) ([ed9f8ea](https://github.com/fagemx/vm0/commit/ed9f8ea828a1aeef64d156fc90295d810aee8bfe))
* **web:** inject connector secrets into agent execution environment ([#2584](https://github.com/fagemx/vm0/issues/2584)) ([f483b5b](https://github.com/fagemx/vm0/commit/f483b5b0c0c94e45a149f99b8f108c3fc74399a4))
* **web:** inject connector secrets only for explicit ${{ secrets.* }} references ([#2599](https://github.com/fagemx/vm0/issues/2599)) ([281baa0](https://github.com/fagemx/vm0/commit/281baa07e0451371f176d4546c7a7b8f6d3059f2)), closes [#2598](https://github.com/fagemx/vm0/issues/2598)
* **web:** make storage download ambiguous-prefix test deterministic ([#2572](https://github.com/fagemx/vm0/issues/2572)) ([e48f09e](https://github.com/fagemx/vm0/commit/e48f09ebf9c341c8e3647adba05b6b50e968eee4)), closes [#2562](https://github.com/fagemx/vm0/issues/2562)
* **web:** make vars validation respect checkenv flag ([#2960](https://github.com/fagemx/vm0/issues/2960)) ([a52b291](https://github.com/fagemx/vm0/commit/a52b291dbbadec36d048387aa1f76c4131d44fd5))
* **web:** rebuild migration snapshots for consistency ([#3070](https://github.com/fagemx/vm0/issues/3070)) ([c455382](https://github.com/fagemx/vm0/commit/c4553824116e78002f755bcdac28a8041055ac2e))
* **web:** resolve build warnings for circular imports, ssh2, and e2b ([#2933](https://github.com/fagemx/vm0/issues/2933)) ([87ac6c4](https://github.com/fagemx/vm0/commit/87ac6c4a1884629e415447e37e2f2055b5f8b3a3))
* **web:** suppress remaining build warnings ([#2953](https://github.com/fagemx/vm0/issues/2953)) ([8bd2c4f](https://github.com/fagemx/vm0/commit/8bd2c4f5bc069f1ca9018ceb99703fd5b3938dd0))
* **web:** validate locale before dynamic import in i18n config ([#2453](https://github.com/fagemx/vm0/issues/2453)) ([0a84b2a](https://github.com/fagemx/vm0/commit/0a84b2a224d9af8099a5cda452cbc3c1df1d3379)), closes [#2452](https://github.com/fagemx/vm0/issues/2452)


### Performance Improvements

* **ci:** speed up preview deploy with vercel prebuilt and skip sentry source maps ([#2712](https://github.com/fagemx/vm0/issues/2712)) ([bf2fdfd](https://github.com/fagemx/vm0/commit/bf2fdfdb9c10137bcafe3099f8c107bece82eee6))
* **web:** add vm0-cli e2b template for faster compose jobs ([#2519](https://github.com/fagemx/vm0/issues/2519)) ([d560bde](https://github.com/fagemx/vm0/commit/d560bde2f2fb3fc3b71b7f2c125709ab6c66008a)), closes [#2516](https://github.com/fagemx/vm0/issues/2516)
* **web:** optimize agent API query performance with JOINs and Promise.all ([#2816](https://github.com/fagemx/vm0/issues/2816)) ([5149283](https://github.com/fagemx/vm0/commit/5149283480a3c8c2525a75dace00b6c41946f203))
* **web:** replace N+1 queries with JOIN in runs list endpoint ([#2501](https://github.com/fagemx/vm0/issues/2501)) ([e426b59](https://github.com/fagemx/vm0/commit/e426b595771fc6348a45d5fe843e68c2134af358))
* **web:** replace N+1 upsert loop with single INSERT...SELECT in aggregate-usage cron ([#2795](https://github.com/fagemx/vm0/issues/2795)) ([f5dd92c](https://github.com/fagemx/vm0/commit/f5dd92c2f1704697895e07fd8fce6b65fe0735dd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @vm0/core bumped to 8.19.0
</details>

<details><summary>ably-subscriber: 0.2.0</summary>

## [0.2.0](https://github.com/fagemx/vm0/compare/ably-subscriber-v0.1.0...ably-subscriber-v0.2.0) (2026-02-21)


### Features

* **ably-subscriber:** add dropped message counter for backpressure observability ([#2913](https://github.com/fagemx/vm0/issues/2913)) ([94325b9](https://github.com/fagemx/vm0/commit/94325b9481f84026e046b04a96ca7878702c8080)), closes [#2909](https://github.com/fagemx/vm0/issues/2909)
* **ably-subscriber:** add rust ably realtime subscribe-only sdk ([#2790](https://github.com/fagemx/vm0/issues/2790)) ([d1f630c](https://github.com/fagemx/vm0/commit/d1f630cb2d30aab52e46a7aba20f9495da00d2cd))
* **ably-subscriber:** extract timing constants into configurable struct ([#2938](https://github.com/fagemx/vm0/issues/2938)) ([0ac4072](https://github.com/fagemx/vm0/commit/0ac407272ac166f134d2ca61874f58214a966849))


### Bug Fixes

* **crates:** use system tls certificates instead of bundled webpki-roots ([#2824](https://github.com/fagemx/vm0/issues/2824)) ([aa95e93](https://github.com/fagemx/vm0/commit/aa95e9328dc99d77215d30e8545de11211a12792))
</details>

<details><summary>guest-agent: 0.2.0</summary>

## [0.2.0](https://github.com/fagemx/vm0/compare/guest-agent-v0.1.0...guest-agent-v0.2.0) (2026-02-21)


### Features

* **guest-agent:** implement rust guest-agent crate ([#2759](https://github.com/fagemx/vm0/issues/2759)) ([8a91042](https://github.com/fagemx/vm0/commit/8a910429b6adb47c86659638e69f5a6d024e4851))
* **guest-mock-claude:** add rust mock-claude binary for firecracker vms ([#2783](https://github.com/fagemx/vm0/issues/2783)) ([d06b37a](https://github.com/fagemx/vm0/commit/d06b37a3c19449f049c83cf32b690bf40c6f77a5))


### Bug Fixes

* **crates:** remove dead code and fix type inconsistency ([#2826](https://github.com/fagemx/vm0/issues/2826)) ([63b19d5](https://github.com/fagemx/vm0/commit/63b19d57ed29dfbf8c1b3c79a43bc1ebf6a94d96))
* **guest-agent:** add tests and document review followup items ([#2775](https://github.com/fagemx/vm0/issues/2775)) ([4c85ea2](https://github.com/fagemx/vm0/commit/4c85ea2a731047c6ec459718362aa22a71ab3673))
* **guest-agent:** skip api calls in local provider mode ([#3164](https://github.com/fagemx/vm0/issues/3164)) ([6d6d7cd](https://github.com/fagemx/vm0/commit/6d6d7cd1423fa59a69ba651a4d32763bca8cfffe))
* **runner:** make runner sole reporter of job completion ([#2852](https://github.com/fagemx/vm0/issues/2852)) ([807e2f9](https://github.com/fagemx/vm0/commit/807e2f9489ff4780eb3ff235d0eac2baae1b37d1))
</details>

<details><summary>guest-download: 0.1.1</summary>

## [0.1.1](https://github.com/fagemx/vm0/compare/guest-download-v0.1.0...guest-download-v0.1.1) (2026-02-21)


### Bug Fixes

* **guest-download:** only treat 404 as non-fatal for artifact downloads ([#2900](https://github.com/fagemx/vm0/issues/2900)) ([8711a0f](https://github.com/fagemx/vm0/commit/8711a0f5cfad3ac0fa8eda31ff74d48e3fbcde6e))
* **guest-download:** retry on 429 rate limiting ([#2911](https://github.com/fagemx/vm0/issues/2911)) ([8913f1d](https://github.com/fagemx/vm0/commit/8913f1d0da2d36cbbf286fab12a6bef6ff4d14aa)), closes [#2905](https://github.com/fagemx/vm0/issues/2905)
* **guest-download:** skip retry on 4xx errors and log failed url ([#2846](https://github.com/fagemx/vm0/issues/2846)) ([8579be9](https://github.com/fagemx/vm0/commit/8579be91fa132202f4d0b7361e3fe602fc538e3d))
* **guest-download:** use is_valid_url for artifact and preserve panic info ([#2827](https://github.com/fagemx/vm0/issues/2827)) ([55e6b66](https://github.com/fagemx/vm0/commit/55e6b660e28f5c7e6744cc2850f884eba2e9296b))
</details>

<details><summary>guest-init: 0.1.1</summary>

## [0.1.1](https://github.com/fagemx/vm0/compare/guest-init-v0.1.0...guest-init-v0.1.1) (2026-02-21)


### Bug Fixes

* **vsock-guest:** handle echild race with pid 1 zombie reaper ([#3118](https://github.com/fagemx/vm0/issues/3118)) ([985f349](https://github.com/fagemx/vm0/commit/985f349134b981d6123fe26ee79f991ec56ceb59))
</details>

<details><summary>guest-mock-claude: 0.2.0</summary>

## [0.2.0](https://github.com/fagemx/vm0/compare/guest-mock-claude-v0.1.0...guest-mock-claude-v0.2.0) (2026-02-21)


### Features

* **guest-mock-claude:** add rust mock-claude binary for firecracker vms ([#2783](https://github.com/fagemx/vm0/issues/2783)) ([d06b37a](https://github.com/fagemx/vm0/commit/d06b37a3c19449f049c83cf32b690bf40c6f77a5))
</details>

<details><summary>runner-rs: 0.2.0</summary>

## [0.2.0](https://github.com/fagemx/vm0/compare/runner-rs-v0.1.0...runner-rs-v0.2.0) (2026-02-21)


### Features

* allow users to set timezone preference for sandbox and scheduling ([#2866](https://github.com/fagemx/vm0/issues/2866)) ([89437c7](https://github.com/fagemx/vm0/commit/89437c733b4e34eee46009b20c99f455c5963289))
* **guest-agent:** implement rust guest-agent crate ([#2759](https://github.com/fagemx/vm0/issues/2759)) ([8a91042](https://github.com/fagemx/vm0/commit/8a910429b6adb47c86659638e69f5a6d024e4851))
* **runner:** add --dry-run flag to rootfs, snapshot, and build commands ([#3169](https://github.com/fagemx/vm0/issues/3169)) ([62b62e3](https://github.com/fagemx/vm0/commit/62b62e3cf2931ae14a67ed8d481f702131a4e323)), closes [#3168](https://github.com/fagemx/vm0/issues/3168)
* **runner:** add --env flag to runner service start/install ([#3112](https://github.com/fagemx/vm0/issues/3112)) ([d2f8ec8](https://github.com/fagemx/vm0/commit/d2f8ec85ca4591ac4f4aa12ffebc073bd1f6ed9f))
* **runner:** add `runner doctor` command for runtime health diagnostics ([#3138](https://github.com/fagemx/vm0/issues/3138)) ([e075414](https://github.com/fagemx/vm0/commit/e075414291d0aa313af2f903f2f46d75ab0f92b8))
* **runner:** add `runner gc` command to clean up unused rootfs and snapshots ([#3128](https://github.com/fagemx/vm0/issues/3128)) ([d4e6235](https://github.com/fagemx/vm0/commit/d4e6235c40a63d4f1411ce982ab1800d905d6fe7))
* **runner:** add `setup` command to download firecracker and kernel ([#2825](https://github.com/fagemx/vm0/issues/2825)) ([f5ba977](https://github.com/fagemx/vm0/commit/f5ba9773e0c4ed54c56cad26d30abc3dafa1bfda))
* **runner:** add ably realtime subscription to start command ([#3048](https://github.com/fagemx/vm0/issues/3048)) ([553ba2d](https://github.com/fagemx/vm0/commit/553ba2d1727466fd30683a4dd690036df995d7e9))
* **runner:** add benchmark subcommand for single-shot vm execution ([#2982](https://github.com/fagemx/vm0/issues/2982)) ([a4ee02a](https://github.com/fagemx/vm0/commit/a4ee02ad56e2c86b6a4bbbc9f03fa6ebe99c474c))
* **runner:** add build command combining rootfs + snapshot ([#2914](https://github.com/fagemx/vm0/issues/2914)) ([305c038](https://github.com/fagemx/vm0/commit/305c03867368a44f30d2421e9f23490ec91e960f))
* **runner:** add build-rootfs command to replace bash script ([#2858](https://github.com/fagemx/vm0/issues/2858)) ([3a298f6](https://github.com/fagemx/vm0/commit/3a298f6a29941e14e062cfb4301ea112c69ccad4))
* **runner:** add execution telemetry for sandbox operations ([#3068](https://github.com/fagemx/vm0/issues/3068)) ([4e7fbb3](https://github.com/fagemx/vm0/commit/4e7fbb3545f1d548a8e6345d120b560a0a3439a2))
* **runner:** add firewall rules and seal secrets to proxy registry ([#3028](https://github.com/fagemx/vm0/issues/3028)) ([752f9b5](https://github.com/fagemx/vm0/commit/752f9b549447dde65c23bd81bcc9e805796d441d))
* **runner:** add kill command to terminate running sandboxes ([#3153](https://github.com/fagemx/vm0/issues/3153)) ([26d4e7d](https://github.com/fagemx/vm0/commit/26d4e7d1763eaa55166e243ecc96052ceba15c7c))
* **runner:** add local job provider and submit command ([#3158](https://github.com/fagemx/vm0/issues/3158)) ([4d300cb](https://github.com/fagemx/vm0/commit/4d300cb95baa0713866d7332a050e4b5b32c6ac1))
* **runner:** add mitmproxy integration to benchmark command ([#3027](https://github.com/fagemx/vm0/issues/3027)) ([7dab1cd](https://github.com/fagemx/vm0/commit/7dab1cd38f8c4e58fbdca98890b5a3b21bf53e9e))
* **runner:** add proxy support to start command ([#3045](https://github.com/fagemx/vm0/issues/3045)) ([5a7016f](https://github.com/fagemx/vm0/commit/5a7016f20e698c616728d42bca481c8c87338623))
* **runner:** add runner.yaml config file generated by build ([#2935](https://github.com/fagemx/vm0/issues/2935)) ([9b9577a](https://github.com/fagemx/vm0/commit/9b9577a3197b72f64866ff12769fa919c252a347))
* **runner:** add service subcommand for systemd lifecycle management ([#3098](https://github.com/fagemx/vm0/issues/3098)) ([9686c65](https://github.com/fagemx/vm0/commit/9686c659797f53c58333903968a4b3b62d3523ef))
* **runner:** add snapshot subcommand with content-addressable caching ([#2903](https://github.com/fagemx/vm0/issues/2903)) ([c00ab8d](https://github.com/fagemx/vm0/commit/c00ab8d387bcdca0917ed1efd13a870c032adf44))
* **runner:** add version flag to cli ([#3038](https://github.com/fagemx/vm0/issues/3038)) ([0afc49a](https://github.com/fagemx/vm0/commit/0afc49a163e76d6f999fb9c94ff3067109f0ff8e))
* **runner:** auto-restart mitmproxy on crash ([#3083](https://github.com/fagemx/vm0/issues/3083)) ([2261025](https://github.com/fagemx/vm0/commit/2261025f85537333b76299903748be96c5c9dfb5))
* **runner:** detect oom kills and return clear error message ([#3093](https://github.com/fagemx/vm0/issues/3093)) ([38718c9](https://github.com/fagemx/vm0/commit/38718c9a00485e33a623954778e41cdfda89ec0f))
* **runner:** download and install mitmdump in setup command ([#2838](https://github.com/fagemx/vm0/issues/2838)) ([d171672](https://github.com/fagemx/vm0/commit/d171672409b0cdd1b850dc3db07d1ecbc5592364))
* **runner:** gc stale network log files older than 7 days ([#3137](https://github.com/fagemx/vm0/issues/3137)) ([43bb9c1](https://github.com/fagemx/vm0/commit/43bb9c1ec457b208005333bcdd570c2860fbc429))
* **runner:** implement rust runner crate for job polling and execution ([#2722](https://github.com/fagemx/vm0/issues/2722)) ([38b494e](https://github.com/fagemx/vm0/commit/38b494e563f0c87486419a36df265fe5c0d8c032))
* **runner:** log snapshot file sizes (logical and disk) ([#2997](https://github.com/fagemx/vm0/issues/2997)) ([671cbad](https://github.com/fagemx/vm0/commit/671cbad4d55594dbc5df4858fa6acbfffcbee57b))
* **runner:** replace socket-based local provider with file queue ([#3166](https://github.com/fagemx/vm0/issues/3166)) ([658c007](https://github.com/fagemx/vm0/commit/658c007f30a633934d4d691791b46361ddf236fc))
* **runner:** upload mitmproxy network logs to telemetry endpoint ([#3071](https://github.com/fagemx/vm0/issues/3071)) ([80023b0](https://github.com/fagemx/vm0/commit/80023b0f627d6b3b57bd1aa9a46cd4244118710e))
* **runner:** use service install/drain in ci upgrade test ([#3167](https://github.com/fagemx/vm0/issues/3167)) ([4ebb1d7](https://github.com/fagemx/vm0/commit/4ebb1d73afd5405cdbe21d0c4aa88280606f386b))
* **runner:** write logs to file in addition to stderr ([#3101](https://github.com/fagemx/vm0/issues/3101)) ([fa4000b](https://github.com/fagemx/vm0/commit/fa4000bec7db04abcc040076121c43caecbf3354))
* **sandbox-fc:** per-sandbox proxy control with dual-queue netns pool ([#3035](https://github.com/fagemx/vm0/issues/3035)) ([deda648](https://github.com/fagemx/vm0/commit/deda64875625f49f4a72513d2b286dba12be0986)), closes [#3033](https://github.com/fagemx/vm0/issues/3033)
* **vsock:** add environment variable support to exec/spawn_watch ([#2736](https://github.com/fagemx/vm0/issues/2736)) ([6f93486](https://github.com/fagemx/vm0/commit/6f9348601ae5736e20a8c32a2064ac394a70e70b))
* **vsock:** add sudo flag to exec/spawn_watch protocol ([#2985](https://github.com/fagemx/vm0/issues/2985)) ([9c42331](https://github.com/fagemx/vm0/commit/9c423314a07f8de0f1b92ea3adca4efa4c6de987)), closes [#2984](https://github.com/fagemx/vm0/issues/2984)


### Bug Fixes

* **crates:** remove dead code and fix type inconsistency ([#2826](https://github.com/fagemx/vm0/issues/2826)) ([63b19d5](https://github.com/fagemx/vm0/commit/63b19d57ed29dfbf8c1b3c79a43bc1ebf6a94d96))
* **crates:** use system tls certificates instead of bundled webpki-roots ([#2824](https://github.com/fagemx/vm0/issues/2824)) ([aa95e93](https://github.com/fagemx/vm0/commit/aa95e9328dc99d77215d30e8545de11211a12792))
* **runner:** add exclusive lock on base_dir to prevent silent data corruption ([#3126](https://github.com/fagemx/vm0/issues/3126)) ([61ac8b7](https://github.com/fagemx/vm0/commit/61ac8b7e9121465d934f77c9dd8fb47acbc883ab)), closes [#3125](https://github.com/fagemx/vm0/issues/3125)
* **runner:** add flock to prevent concurrent rootfs/snapshot builds ([#2980](https://github.com/fagemx/vm0/issues/2980)) ([96a8559](https://github.com/fagemx/vm0/commit/96a8559f03ebebc0833af97d7bfe5c3c1562cb24))
* **runner:** add path validation and ci hash guards ([#3161](https://github.com/fagemx/vm0/issues/3161)) ([c5313ff](https://github.com/fagemx/vm0/commit/c5313ffdaee030c5fb3d48b950c8d7b6e36e90ae))
* **runner:** clean up request_start_times on flow error in mitm-addon ([#3076](https://github.com/fagemx/vm0/issues/3076)) ([a6e8cb1](https://github.com/fagemx/vm0/commit/a6e8cb1d9b9dece53f66aea35b8c32627bf4270e)), closes [#3073](https://github.com/fagemx/vm0/issues/3073)
* **runner:** exclude network log upload from cleanup telemetry metric ([#3075](https://github.com/fagemx/vm0/issues/3075)) ([5b1beb1](https://github.com/fagemx/vm0/commit/5b1beb1a06cf19ebc67ba435a03ada529ef47f22)), closes [#3072](https://github.com/fagemx/vm0/issues/3072)
* **runner:** forward mock-claude env var to guest ([#3089](https://github.com/fagemx/vm0/issues/3089)) ([2978851](https://github.com/fagemx/vm0/commit/297885167fb36a2fcd1b3a5566a4c00bf4a571cb)), closes [#3088](https://github.com/fagemx/vm0/issues/3088)
* **runner:** gc removes unused lock files with safe inode recheck ([#3132](https://github.com/fagemx/vm0/issues/3132)) ([1e9d234](https://github.com/fagemx/vm0/commit/1e9d2345cb3209ade7b8f17f221f3621e9915172)), closes [#3131](https://github.com/fagemx/vm0/issues/3131)
* **runner:** prevent vm process leak on executor task panic ([#3079](https://github.com/fagemx/vm0/issues/3079)) ([6677bb5](https://github.com/fagemx/vm0/commit/6677bb55aa95096988c634879b23a775c9d63352)), closes [#3078](https://github.com/fagemx/vm0/issues/3078)
* **runner:** re-establish ably subscription after fatal error ([#3077](https://github.com/fagemx/vm0/issues/3077)) ([be681ca](https://github.com/fagemx/vm0/commit/be681cada26167aa8ebe1809edb326621902085b)), closes [#3074](https://github.com/fagemx/vm0/issues/3074)
* **runner:** sanitize runner name used in log file prefix ([#3103](https://github.com/fagemx/vm0/issues/3103)) ([b028b89](https://github.com/fagemx/vm0/commit/b028b89440019c077c0a0fc8cfced3178f74d797))
* **runner:** set node ca certs env var for mitm mode ([#3091](https://github.com/fagemx/vm0/issues/3091)) ([8626d58](https://github.com/fagemx/vm0/commit/8626d58b203a6fdbabea21aa21cb228ddc9cff78))
* **runner:** sort gc artifacts by last-used time instead of creation time ([#3130](https://github.com/fagemx/vm0/issues/3130)) ([42efcb2](https://github.com/fagemx/vm0/commit/42efcb29da6ef4d96fe6fb640953354f12bda516))
* **runner:** use run_id as sandbox_id instead of random uuid ([#3151](https://github.com/fagemx/vm0/issues/3151)) ([3e13c72](https://github.com/fagemx/vm0/commit/3e13c727b7a972c76b0f96c56e59ef2e65eca864))
* **runner:** walk ppid chain for orphan detection instead of checking immediate parent ([#3154](https://github.com/fagemx/vm0/issues/3154)) ([c377a54](https://github.com/fagemx/vm0/commit/c377a544643cd1908b32e505d533448ed73bc98c))
* **sandbox-fc:** move runtime sockets to /run/vm0 to fix sun_path limit ([#2951](https://github.com/fagemx/vm0/issues/2951)) ([#2966](https://github.com/fagemx/vm0/issues/2966)) ([4b91e0d](https://github.com/fagemx/vm0/commit/4b91e0d9ad2f677475afd768f95f19af852c9b46))


### Performance Improvements

* **sandbox-fc:** include prewarm script in snapshot hash computation ([#3004](https://github.com/fagemx/vm0/issues/3004)) ([3c27ac0](https://github.com/fagemx/vm0/commit/3c27ac0b4ffb8ab487fbea71cf62bf9681f31b0f)), closes [#3002](https://github.com/fagemx/vm0/issues/3002)
</details>

<details><summary>sandbox: 0.2.0</summary>

## [0.2.0](https://github.com/fagemx/vm0/compare/sandbox-v0.1.0...sandbox-v0.2.0) (2026-02-21)


### Features

* **crates:** add sandbox crate with core traits and types ([#2527](https://github.com/fagemx/vm0/issues/2527)) ([a7571b4](https://github.com/fagemx/vm0/commit/a7571b4ae61b41825eee3b73a59cc2d4f1f6ecb0))
* **runner:** add mitmproxy integration to benchmark command ([#3027](https://github.com/fagemx/vm0/issues/3027)) ([7dab1cd](https://github.com/fagemx/vm0/commit/7dab1cd38f8c4e58fbdca98890b5a3b21bf53e9e))
* **runner:** add snapshot subcommand with content-addressable caching ([#2903](https://github.com/fagemx/vm0/issues/2903)) ([c00ab8d](https://github.com/fagemx/vm0/commit/c00ab8d387bcdca0917ed1efd13a870c032adf44))
* **runner:** implement rust runner crate for job polling and execution ([#2722](https://github.com/fagemx/vm0/issues/2722)) ([38b494e](https://github.com/fagemx/vm0/commit/38b494e563f0c87486419a36df265fe5c0d8c032))
* **sandbox-fc:** implement sandbox lifecycle with state machine and resource management ([#2625](https://github.com/fagemx/vm0/issues/2625)) ([fa3a92d](https://github.com/fagemx/vm0/commit/fa3a92dbbb256ae0d9a378a87665927813fffa8c))
* **sandbox-fc:** per-sandbox proxy control with dual-queue netns pool ([#3035](https://github.com/fagemx/vm0/issues/3035)) ([deda648](https://github.com/fagemx/vm0/commit/deda64875625f49f4a72513d2b286dba12be0986)), closes [#3033](https://github.com/fagemx/vm0/issues/3033)
* **vsock:** add environment variable support to exec/spawn_watch ([#2736](https://github.com/fagemx/vm0/issues/2736)) ([6f93486](https://github.com/fagemx/vm0/commit/6f9348601ae5736e20a8c32a2064ac394a70e70b))
* **vsock:** add sudo flag to exec/spawn_watch protocol ([#2985](https://github.com/fagemx/vm0/issues/2985)) ([9c42331](https://github.com/fagemx/vm0/commit/9c423314a07f8de0f1b92ea3adca4efa4c6de987)), closes [#2984](https://github.com/fagemx/vm0/issues/2984)


### Bug Fixes

* **crates:** remove dead code and fix type inconsistency ([#2826](https://github.com/fagemx/vm0/issues/2826)) ([63b19d5](https://github.com/fagemx/vm0/commit/63b19d57ed29dfbf8c1b3c79a43bc1ebf6a94d96))
</details>

<details><summary>sandbox-fc: 0.2.0</summary>

## [0.2.0](https://github.com/fagemx/vm0/compare/sandbox-fc-v0.1.0...sandbox-fc-v0.2.0) (2026-02-21)


### Features

* **runner:** add mitmproxy integration to benchmark command ([#3027](https://github.com/fagemx/vm0/issues/3027)) ([7dab1cd](https://github.com/fagemx/vm0/commit/7dab1cd38f8c4e58fbdca98890b5a3b21bf53e9e))
* **runner:** add runner.yaml config file generated by build ([#2935](https://github.com/fagemx/vm0/issues/2935)) ([9b9577a](https://github.com/fagemx/vm0/commit/9b9577a3197b72f64866ff12769fa919c252a347))
* **runner:** add snapshot subcommand with content-addressable caching ([#2903](https://github.com/fagemx/vm0/issues/2903)) ([c00ab8d](https://github.com/fagemx/vm0/commit/c00ab8d387bcdca0917ed1efd13a870c032adf44))
* **runner:** implement rust runner crate for job polling and execution ([#2722](https://github.com/fagemx/vm0/issues/2722)) ([38b494e](https://github.com/fagemx/vm0/commit/38b494e563f0c87486419a36df265fe5c0d8c032))
* **sandbox-fc:** add network namespace pool and command execution ([#2576](https://github.com/fagemx/vm0/issues/2576)) ([cb97bca](https://github.com/fagemx/vm0/commit/cb97bca8e0ccf02e19c7f1dfe5423cde3d1a72f8))
* **sandbox-fc:** add overlay filesystem pool for pre-warmed vm images ([#2586](https://github.com/fagemx/vm0/issues/2586)) ([313c74e](https://github.com/fagemx/vm0/commit/313c74eb4ed061161b2e9901c323ba45adde0aa3))
* **sandbox-fc:** add test binary for manual lifecycle testing ([#2642](https://github.com/fagemx/vm0/issues/2642)) ([c4f9e22](https://github.com/fagemx/vm0/commit/c4f9e227a43421a890808b8c946391faa4eafaec))
* **sandbox-fc:** add unified prerequisites check to factory init ([#2651](https://github.com/fagemx/vm0/issues/2651)) ([a0a4868](https://github.com/fagemx/vm0/commit/a0a4868a6175e1022c8eb91fda2907fbe1dd6105))
* **sandbox-fc:** auto-allocate netns pool index via flock ([#2708](https://github.com/fagemx/vm0/issues/2708)) ([828ed61](https://github.com/fagemx/vm0/commit/828ed619217245d4a87a1afa27290ba175232143)), closes [#2704](https://github.com/fagemx/vm0/issues/2704)
* **sandbox-fc:** implement sandbox lifecycle with state machine and resource management ([#2625](https://github.com/fagemx/vm0/issues/2625)) ([fa3a92d](https://github.com/fagemx/vm0/commit/fa3a92dbbb256ae0d9a378a87665927813fffa8c))
* **sandbox-fc:** implement snapshot creation workflow ([#2668](https://github.com/fagemx/vm0/issues/2668)) ([02d4418](https://github.com/fagemx/vm0/commit/02d441840260d6257e9e52cca72330cb1568fb41))
* **sandbox-fc:** implement snapshot restore via firecracker http api ([#2662](https://github.com/fagemx/vm0/issues/2662)) ([a622c08](https://github.com/fagemx/vm0/commit/a622c08eb897c2c0699dc08ea62079919aa33ab3))
* **sandbox-fc:** per-sandbox proxy control with dual-queue netns pool ([#3035](https://github.com/fagemx/vm0/issues/3035)) ([deda648](https://github.com/fagemx/vm0/commit/deda64875625f49f4a72513d2b286dba12be0986)), closes [#3033](https://github.com/fagemx/vm0/issues/3033)
* **sandbox-fc:** proactive crash notification for firecracker sandbox ([#3087](https://github.com/fagemx/vm0/issues/3087)) ([ff6a795](https://github.com/fagemx/vm0/commit/ff6a795b77c42f389fc2b998dda9e262b1049c46))
* **vsock:** add environment variable support to exec/spawn_watch ([#2736](https://github.com/fagemx/vm0/issues/2736)) ([6f93486](https://github.com/fagemx/vm0/commit/6f9348601ae5736e20a8c32a2064ac394a70e70b))
* **vsock:** add sudo flag to exec/spawn_watch protocol ([#2985](https://github.com/fagemx/vm0/issues/2985)) ([9c42331](https://github.com/fagemx/vm0/commit/9c423314a07f8de0f1b92ea3adca4efa4c6de987)), closes [#2984](https://github.com/fagemx/vm0/issues/2984)


### Bug Fixes

* **crates:** remove dead code and fix type inconsistency ([#2826](https://github.com/fagemx/vm0/issues/2826)) ([63b19d5](https://github.com/fagemx/vm0/commit/63b19d57ed29dfbf8c1b3c79a43bc1ebf6a94d96))
* **runner:** add flock to prevent concurrent rootfs/snapshot builds ([#2980](https://github.com/fagemx/vm0/issues/2980)) ([96a8559](https://github.com/fagemx/vm0/commit/96a8559f03ebebc0833af97d7bfe5c3c1562cb24))
* **runner:** prevent vm process leak on executor task panic ([#3079](https://github.com/fagemx/vm0/issues/3079)) ([6677bb5](https://github.com/fagemx/vm0/commit/6677bb55aa95096988c634879b23a775c9d63352)), closes [#3078](https://github.com/fagemx/vm0/issues/3078)
* **sandbox-fc:** add prerequisite checks to create_snapshot ([#2971](https://github.com/fagemx/vm0/issues/2971)) ([f508fa2](https://github.com/fagemx/vm0/commit/f508fa2cfc6a70900670377f029b041b53ac8cdd))
* **sandbox-fc:** check /dev/kvm read-write permission in prerequisites ([#2657](https://github.com/fagemx/vm0/issues/2657)) ([0507615](https://github.com/fagemx/vm0/commit/0507615b626ec4754694547fd0bda79ceac10f48))
* **sandbox-fc:** move runtime sockets to /run/vm0 to fix sun_path limit ([#2951](https://github.com/fagemx/vm0/issues/2951)) ([#2966](https://github.com/fagemx/vm0/issues/2966)) ([4b91e0d](https://github.com/fagemx/vm0/commit/4b91e0d9ad2f677475afd768f95f19af852c9b46))
* **sandbox-fc:** redesign api error as enum to distinguish fatal from retryable errors ([#2700](https://github.com/fagemx/vm0/issues/2700)) ([dae4042](https://github.com/fagemx/vm0/commit/dae40421ec934018cfef485d73dabc5cdac33672))
* **sandbox-fc:** reject sudo invocation and clean stale work dir on snapshot ([#2698](https://github.com/fagemx/vm0/issues/2698)) ([f298633](https://github.com/fagemx/vm0/commit/f2986332cdc212167e5dd4323039ddaf554859e4)), closes [#2696](https://github.com/fagemx/vm0/issues/2696)


### Performance Improvements

* **sandbox-fc:** include prewarm script in snapshot hash computation ([#3004](https://github.com/fagemx/vm0/issues/3004)) ([3c27ac0](https://github.com/fagemx/vm0/commit/3c27ac0b4ffb8ab487fbea71cf62bf9681f31b0f)), closes [#3002](https://github.com/fagemx/vm0/issues/3002)
* **sandbox-fc:** pre-warm pam cache during snapshot creation ([#3000](https://github.com/fagemx/vm0/issues/3000)) ([8b95fcd](https://github.com/fagemx/vm0/commit/8b95fcdb9e33b1ea89b68d4ff6eef210f74cf91c)), closes [#2994](https://github.com/fagemx/vm0/issues/2994)
</details>

<details><summary>vsock-guest: 0.2.0</summary>

## [0.2.0](https://github.com/fagemx/vm0/compare/vsock-guest-v0.1.0...vsock-guest-v0.2.0) (2026-02-21)


### Features

* **vsock:** add environment variable support to exec/spawn_watch ([#2736](https://github.com/fagemx/vm0/issues/2736)) ([6f93486](https://github.com/fagemx/vm0/commit/6f9348601ae5736e20a8c32a2064ac394a70e70b))
* **vsock:** add sudo flag to exec/spawn_watch protocol ([#2985](https://github.com/fagemx/vm0/issues/2985)) ([9c42331](https://github.com/fagemx/vm0/commit/9c423314a07f8de0f1b92ea3adca4efa4c6de987)), closes [#2984](https://github.com/fagemx/vm0/issues/2984)


### Bug Fixes

* **vsock-guest:** handle echild race with pid 1 zombie reaper ([#3118](https://github.com/fagemx/vm0/issues/3118)) ([985f349](https://github.com/fagemx/vm0/commit/985f349134b981d6123fe26ee79f991ec56ceb59))
</details>

<details><summary>vsock-host: 0.2.0</summary>

## [0.2.0](https://github.com/fagemx/vm0/compare/vsock-host-v0.1.0...vsock-host-v0.2.0) (2026-02-21)


### Features

* **vsock:** add environment variable support to exec/spawn_watch ([#2736](https://github.com/fagemx/vm0/issues/2736)) ([6f93486](https://github.com/fagemx/vm0/commit/6f9348601ae5736e20a8c32a2064ac394a70e70b))
* **vsock:** add sudo flag to exec/spawn_watch protocol ([#2985](https://github.com/fagemx/vm0/issues/2985)) ([9c42331](https://github.com/fagemx/vm0/commit/9c423314a07f8de0f1b92ea3adca4efa4c6de987)), closes [#2984](https://github.com/fagemx/vm0/issues/2984)
</details>

<details><summary>vsock-proto: 0.2.0</summary>

## [0.2.0](https://github.com/fagemx/vm0/compare/vsock-proto-v0.1.0...vsock-proto-v0.2.0) (2026-02-21)


### Features

* **vsock:** add environment variable support to exec/spawn_watch ([#2736](https://github.com/fagemx/vm0/issues/2736)) ([6f93486](https://github.com/fagemx/vm0/commit/6f9348601ae5736e20a8c32a2064ac394a70e70b))
* **vsock:** add sudo flag to exec/spawn_watch protocol ([#2985](https://github.com/fagemx/vm0/issues/2985)) ([9c42331](https://github.com/fagemx/vm0/commit/9c423314a07f8de0f1b92ea3adca4efa4c6de987)), closes [#2984](https://github.com/fagemx/vm0/issues/2984)
</details>

<details><summary>vsock-test: 0.2.0</summary>

## [0.2.0](https://github.com/fagemx/vm0/compare/vsock-test-v0.1.0...vsock-test-v0.2.0) (2026-02-21)


### Features

* **vsock:** add environment variable support to exec/spawn_watch ([#2736](https://github.com/fagemx/vm0/issues/2736)) ([6f93486](https://github.com/fagemx/vm0/commit/6f9348601ae5736e20a8c32a2064ac394a70e70b))
* **vsock:** add sudo flag to exec/spawn_watch protocol ([#2985](https://github.com/fagemx/vm0/issues/2985)) ([9c42331](https://github.com/fagemx/vm0/commit/9c423314a07f8de0f1b92ea3adca4efa4c6de987)), closes [#2984](https://github.com/fagemx/vm0/issues/2984)
</details>

---
This PR was generated with [Release Please](https://github.com/googleapis/release-please). See [documentation](https://github.com/googleapis/release-please#release-please).