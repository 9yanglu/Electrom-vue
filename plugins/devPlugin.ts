import { ViteDevServer } from "vite";

// 注册了一个名为 configureServer 的钩子，当 Vite 为我们启动 Http 服务的时候，configureServer钩子会被执行
export let devPlugin = () => {
  return {
    name: "dev-plugin",
    configureServer(server: ViteDevServer) {
      require("esbuild").buildSync({
        entryPoints: ["./src/main/mainEntry.ts"],
        bundle: true,
        platform: "node",
        outfile: "./dist/mainEntry.js",
        external: ["electron"],
      });
      // httpServer:调试 Vue 页面的 http 服务
      // 通过监听 server.httpServer 的 listening 事件来判断 httpServer 是否已经成功启动
      server.httpServer?.once("listening", () => {
        let { spawn } = require("child_process");
        let addressInfo = server.httpServer?.address();
        let httpAddress = `http://${addressInfo?.address}:${addressInfo?.port}`;
        // 通过 Node.js child_process 模块的 spawn 方法启动 electron 子进程的
        let electronProcess = spawn(
          require("electron").toString(), //主进程代码编译后的文件路径
          ["./dist/mainEntry.js", httpAddress], //Vue 页面的 http 地址
          {
            cwd: process.cwd(), // process.cwd() 返回的值就是当前项目的根目录
            stdio: "inherit", // 设置 electron 进程的控制台输出。inherit：以让 electron 子进程的控制台输出数据同步到主进程的控制台（主进程的console.log可以在vscode的控制台上看到）
          }
        );
        // 当 electron 子进程退出的时候，我们要关闭 Vite 的 http 服务，并且控制父进程退出，准备下一次启动
        electronProcess.on("close", () => {
          server.close();
          process.exit();
        });
      });
    },
  };
};
