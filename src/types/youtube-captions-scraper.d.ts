declare module 'youtube-captions-scraper' {
    export interface Caption {
        start: number;
        dur: number;
        text: string;
    }

    export interface SubtitleOptions {
        videoID: string;
        lang?: string;
    }

    export function getSubtitles(options: SubtitleOptions): Promise<Caption[]>;
} 