"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPackageJsonDependencies = void 0;
const dependencies_1 = require("@schematics/angular/utility/dependencies");
const dependenciesToAdd = [
    {
        name: 'angular-auth-oidc-client',
        version: '13.0.0',
    },
];
function addPackageJsonDependencies(options) {
    return (host, context) => {
        const dependencies = getDependencies(options);
        for (const pack of dependencies) {
            const nodeDependency = createNodeDependency(pack);
            (0, dependencies_1.addPackageJsonDependency)(host, nodeDependency);
            context.logger.info(`✅️ Added "${pack.name}" ${pack.version}`);
        }
        return host;
    };
}
exports.addPackageJsonDependencies = addPackageJsonDependencies;
function createNodeDependency(pack) {
    const { name, version } = pack;
    return {
        type: dependencies_1.NodeDependencyType.Default,
        name,
        version,
        overwrite: true,
    };
}
function getDependencies(options) {
    const { useLocalPackage } = options;
    if (!useLocalPackage) {
        return dependenciesToAdd;
    }
    return [];
}
//# sourceMappingURL=add-dependencies.js.map