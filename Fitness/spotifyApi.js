"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpotifyProfile = getSpotifyProfile;
exports.searchTracks = searchTracks;
var node_fetch_1 = __importDefault(require("node-fetch"));
var clientId = 'c5080bfc38514efeb204256caaadd2d8';
var clientSecret = '31f66924cb9d46c1bc8a33951bba23c1';
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, node_fetch_1.default)('https://accounts.spotify.com/api/token', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: 'grant_type=client_credentials'
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data.access_token];
            }
        });
    });
}
function getSpotifyProfile() {
    return __awaiter(this, void 0, void 0, function () {
        var token, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAccessToken()];
                case 1:
                    token = _a.sent();
                    return [4 /*yield*/, (0, node_fetch_1.default)('https://api.spotify.com/v1/me', {
                            headers: {
                                'Authorization': "Bearer ".concat(token)
                            }
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to fetch profile');
                    }
                    return [4 /*yield*/, response.json()];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function searchTracks(query) {
    return __awaiter(this, void 0, void 0, function () {
        var token, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAccessToken()];
                case 1:
                    token = _a.sent();
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://api.spotify.com/v1/search?type=track&q=".concat(encodeURIComponent(query)), {
                            headers: {
                                'Authorization': "Bearer ".concat(token)
                            }
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to search tracks');
                    }
                    return [4 /*yield*/, response.json()];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// Example usage: (uncomment to test)
// getSpotifyProfile().then(console.log).catch(console.error);
// searchTracks('your search query').then(console.log).catch(console.error);
