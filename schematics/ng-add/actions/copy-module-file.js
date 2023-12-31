"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyModuleFile = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const angular_utils_1 = require("../../utils/angular-utils");
const schema_1 = require("../schema");
const configs_1 = require("./configs");
function copyModuleFile(options) {
    return (host, context) => {
        const project = (0, angular_utils_1.getProject)(host);
        const { moduleFileName, moduleFolder } = options.moduleInfo;
        const filePath = `${project.sourceRoot}/app/auth/${moduleFileName}.ts`;
        if (host.exists(filePath)) {
            context.logger.info(`✅️ '${filePath}'' already existing - skipping file create`);
            return host;
        }
        const templateConfig = getTemplateConfig(options);
        context.logger.info(`✅️ '${filePath}''will be created`);
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)(`./files/${moduleFolder}`), [
            (0, schematics_1.template)(templateConfig),
            (0, schematics_1.move)((0, core_1.normalize)(`${project.sourceRoot}/app/auth`)),
        ]);
        return (0, schematics_1.chain)([(0, schematics_1.mergeWith)(templateSource)]);
    };
}
exports.copyModuleFile = copyModuleFile;
function getTemplateConfig(options) {
    const { authorityUrlOrTenantId, flowType } = options;
    if (options.isHttpOption) {
        return { ts: 'ts', authorityUrlOrTenantId };
    }
    const authConfig = getConfig(flowType, authorityUrlOrTenantId);
    return { ts: 'ts', authConfig };
}
function getConfig(flowType, authorityUrlOrTenantId) {
    let config = configs_1.DEFAULT_CONFIG;
    switch (flowType) {
        case schema_1.FlowType.OidcCodeFlowPkceAzureAdUsingIframeSilentRenew: {
            config = configs_1.AZURE_AD_SILENT_RENEW;
            break;
        }
        case schema_1.FlowType.OidcCodeFlowPkceAzureAdUsingRefreshTokens: {
            config = configs_1.AZURE_AD_REFRESH_TOKENS;
            break;
        }
        case schema_1.FlowType.OAuthPushAuthorizationRequestsUsingRefreshTokens: {
            config = configs_1.OAUTH_PAR;
            break;
        }
        case schema_1.FlowType.OidcCodeFlowPkceUsingIframeSilentRenew: {
            config = configs_1.IFRAME_SILENT_RENEW;
            break;
        }
        case schema_1.FlowType.OidcCodeFlowPkceUsingIframeSilentRenewGettingConfigFromHttp: {
            throw new schematics_1.SchematicsException(`With HTTP another module is used. No config but another module`);
        }
        case schema_1.FlowType.OIDCCodeFlowPkce: {
            config = configs_1.OIDC_PLAIN;
            break;
        }
        case schema_1.FlowType.Auth0: {
            config = configs_1.AUTH_0;
            break;
        }
        case schema_1.FlowType.OidcCodeFlowPkceUsingRefreshTokens:
        case schema_1.FlowType.DefaultConfig: {
            config = configs_1.DEFAULT_CONFIG;
            break;
        }
        default: {
            throw new schematics_1.SchematicsException(`Could not parse flowType '${flowType}'`);
        }
    }
    return config.replace('<authorityUrlOrTenantId>', authorityUrlOrTenantId);
}
//# sourceMappingURL=copy-module-file.js.map