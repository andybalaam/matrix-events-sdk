/*
Copyright 2022 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {
    EmoteEvent,
    IPartialEvent,
    IPartialLegacyContent,
    M_HTML,
    M_TEXT,
    MessageEvent,
    NoticeEvent,
    parseMRoomMessage,
} from "../../../src";

describe('parseMRoomMessage', () => {
    it('should return an unmodified MessageEvent when using extensible events', () => {
        const input: IPartialEvent<IPartialLegacyContent> = {
            type: "org.example.message-like",
            content: {
                [M_TEXT.name]: "Text here",
                [M_HTML.name]: "HTML here",
            } as any, // force cast for tests
        };
        const message = parseMRoomMessage(input) as MessageEvent;
        expect(message).toBeDefined();
        expect(message instanceof MessageEvent).toBe(true);
        expect(message.html).toBe("HTML here");
        expect(message.text).toBe("Text here");
        expect(message.renderings.length).toBe(2);
        expect(message.renderings.some(r => r.mimetype === "text/html" && r.body === "HTML here")).toBe(true);
        expect(message.renderings.some(r => r.mimetype === "text/plain" && r.body === "Text here")).toBe(true);
    });

    it('should interpret m.text as a MessageEvent', () => {
        const input: IPartialEvent<IPartialLegacyContent> = {
            type: "org.example.message-like",
            content: {
                body: "Text here",
                msgtype: "m.text",
                format: "org.matrix.custom.html",
                formatted_body: "HTML here",
            },
        };
        const message = parseMRoomMessage(input) as MessageEvent;
        expect(message).toBeDefined();
        expect(message instanceof MessageEvent).toBe(true);
        expect(message.html).toBe("HTML here");
        expect(message.text).toBe("Text here");
        expect(message.renderings.length).toBe(2);
        expect(message.renderings.some(r => r.mimetype === "text/html" && r.body === "HTML here")).toBe(true);
        expect(message.renderings.some(r => r.mimetype === "text/plain" && r.body === "Text here")).toBe(true);
    });

    it('should support parsing without HTML', () => {
        const input: IPartialEvent<IPartialLegacyContent> = {
            type: "org.example.message-like",
            content: {
                body: "Text here",
                msgtype: "m.text",
            },
        };
        const message = parseMRoomMessage(input) as MessageEvent;
        expect(message).toBeDefined();
        expect(message instanceof MessageEvent).toBe(true);
        expect(message.html).toBeFalsy();
        expect(message.text).toBe("Text here");
        expect(message.renderings.length).toBe(1);
        expect(message.renderings.some(r => r.mimetype === "text/plain" && r.body === "Text here")).toBe(true);
    });

    it('should interpret m.emote as an EmoteEvent', () => {
        const input: IPartialEvent<IPartialLegacyContent> = {
            type: "org.example.message-like",
            content: {
                body: "Text here",
                msgtype: "m.emote",
                format: "org.matrix.custom.html",
                formatted_body: "HTML here",
            },
        };
        const message = parseMRoomMessage(input) as MessageEvent;
        expect(message).toBeDefined();
        expect(message instanceof EmoteEvent).toBe(true);
        expect(message.html).toBe("HTML here");
        expect(message.text).toBe("Text here");
        expect(message.renderings.length).toBe(2);
        expect(message.renderings.some(r => r.mimetype === "text/html" && r.body === "HTML here")).toBe(true);
        expect(message.renderings.some(r => r.mimetype === "text/plain" && r.body === "Text here")).toBe(true);
    });

    it('should interpret m.notice as a NoticeEvent', () => {
        const input: IPartialEvent<IPartialLegacyContent> = {
            type: "org.example.message-like",
            content: {
                body: "Text here",
                msgtype: "m.notice",
                format: "org.matrix.custom.html",
                formatted_body: "HTML here",
            },
        };
        const message = parseMRoomMessage(input) as MessageEvent;
        expect(message).toBeDefined();
        expect(message instanceof NoticeEvent).toBe(true);
        expect(message.html).toBe("HTML here");
        expect(message.text).toBe("Text here");
        expect(message.renderings.length).toBe(2);
        expect(message.renderings.some(r => r.mimetype === "text/html" && r.body === "HTML here")).toBe(true);
        expect(message.renderings.some(r => r.mimetype === "text/plain" && r.body === "Text here")).toBe(true);
    });

    it('should not interpret unknown msgtypes', () => {
        const input: IPartialEvent<IPartialLegacyContent> = {
            type: "org.example.message-like",
            content: {
                body: "Text here",
                msgtype: "org.example.custom",
                format: "org.matrix.custom.html",
                formatted_body: "HTML here",
            },
        };
        const message = parseMRoomMessage(input);
        expect(message).toBeFalsy();
    });
});
