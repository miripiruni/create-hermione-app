import ora from "ora";
import path from "path";
import { exec } from "child_process";

import fsUtils from "./fsUtils";
import {
    DEFAULT_PM,
    TESTPLANE_JS_CONFIG_NAME,
    TESTPLANE_TS_CONFIG_NAME,
    PMS,
    PACKAGE_JSON,
} from "./constants/packageManagement";
import { Colors } from "./utils/colors";
import { askQuestion, packageNameFromPlugin } from "./utils";
import type { PackageManager } from "./constants/packageManagement";

const getPackageManager = async (dirPath: string, noQuestions: boolean): Promise<PackageManager> => {
    let packageManager: PackageManager | undefined;
    const packageManagers = Object.keys(PMS) as PackageManager[];
    await Promise.all(
        packageManagers.map(async (pm: PackageManager) => {
            const isLockfileExist = await fsUtils.exists(path.resolve(dirPath, PMS[pm].lock));
            if (isLockfileExist) {
                packageManager = pm;
            }
        }),
    );

    if (packageManager) {
        return packageManager;
    }

    if (noQuestions) {
        return DEFAULT_PM;
    }

    return askQuestion<PackageManager>({
        type: "list",
        message: "Choose preferred package manager:",
        choices: Object.keys(PMS),
        default: DEFAULT_PM,
    });
};

const initNodeProject = (dirPath: string, packageManager: PackageManager): Promise<string> =>
    new Promise<string>((resolve, reject) => {
        exec(
            `${packageManager} ${PMS[packageManager].init}`,
            {
                cwd: dirPath,
                env: process.env,
            },
            (error, stdout, stderr) => (error ? reject(stderr) : resolve(stdout)),
        );
    });

export const initApp = async (dirPath: string, noQuestions: boolean): Promise<PackageManager> => {
    await fsUtils.ensureDirectory(dirPath);

    const isTestplaneJsConfigExist = await fsUtils.exists(path.resolve(dirPath, TESTPLANE_JS_CONFIG_NAME));
    const isTestplaneTsConfigExist = await fsUtils.exists(path.resolve(dirPath, TESTPLANE_TS_CONFIG_NAME));
    let testplaneExistingConfigName = null;

    if (isTestplaneJsConfigExist) {
        testplaneExistingConfigName = TESTPLANE_JS_CONFIG_NAME;
    } else if (isTestplaneTsConfigExist) {
        testplaneExistingConfigName = TESTPLANE_TS_CONFIG_NAME;
    }

    if (testplaneExistingConfigName) {
        console.error(`Looks like ${dirPath} already contains ${testplaneExistingConfigName}.`);
        console.error("Please remove old config or choose another directory.");
        process.exit(1);
    }

    const packageManager = await getPackageManager(dirPath, noQuestions);

    const isPackageJsonExist = await fsUtils.exists(path.resolve(dirPath, PACKAGE_JSON));
    if (!isPackageJsonExist) {
        await initNodeProject(dirPath, packageManager);
    }

    return packageManager;
};

export const installPackages = async (
    dirPath: string,
    packageManager: PackageManager,
    pluginsToInstall: string[],
    registry: string,
): Promise<string> => {
    const spinner = ora("Installing packages (this may take a while)").start();

    const pluginsPackages = pluginsToInstall.map(packageNameFromPlugin).join(" ");

    return new Promise<string>((resolve, reject) => {
        exec(
            `${packageManager} ${PMS[packageManager].install} testplane ${pluginsPackages} --registry "${registry}"`,
            {
                cwd: dirPath,
                env: process.env,
            },
            (error, stdout, stderr) => {
                if (error) {
                    spinner.fail("An error occured during installation");
                    reject(stderr);
                } else {
                    spinner.succeed(
                        `Testplane and plugins have been installed successfully at ${Colors.fillGreen(dirPath)}`,
                    );
                    resolve(stdout);
                }
            },
        );
    });
};
