import Title from "@/components/Title"
import VisitorsStatisChat from "./components/VisitorsStatisChat"
import ChartThree from "@/components/Charts/ChartThree"
import ChartTwo from "@/components/Charts/ChartTwo"
import ChatCard from "@/components/Chat/ChatCard"
import MapOne from "@/components/Maps/MapOne"
import TableOne from "@/components/Tables/TableOne"
import CardDataStats from "@/components/CardDataStats"

import { AiOutlineEye, AiOutlineMeh, AiOutlineStock, AiOutlineFieldTime } from "react-icons/ai";
import { useCallback, useEffect, useState } from "react"
import dayjs from 'dayjs';
import { Result } from "./type"


export default () => {
    const [result, setResult] = useState<Result | null>(null);
    const [date, setDate] = useState(dayjs(new Date()).format("YYYY/MM/DD"));
    const [stats, setStats] = useState({
        pv: 0,
        ip: 0,
        bounce: 0,
        avgTime: "",
    });

    const formatTime = (seconds: number) => {
        // 四舍五入到最接近的整数
        const roundedSeconds = Math.round(seconds);

        const h = Math.floor(roundedSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((roundedSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (roundedSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    // 获取统计数据
    const getDataList = async () => {
        const siteId = import.meta.env.VITE_BAIDU_TONGJI_SITE_ID;
        const token = import.meta.env.VITE_BAIDU_TONGJI_ACCESS_TOKEN;

        const response = await fetch(`/api/rest/2.0/tongji/report/getData?access_token=${token}&site_id=${siteId}&start_date=${date}&end_date=${date}&metrics=pv_count%2Cip_count%2Cbounce_ratio%2Cavg_visit_time&method=overview%2FgetTimeTrendRpt`);
        const data = await response.json();
        const { result } = data;
        setResult(result);

        let pv = 0;
        let ip = 0;
        let bounce = 0;
        let avgTime = 0;
        let count = 0

        result.items[1].forEach((item: number[]) => {
            if (!Number(item[0])) return;

            count++
            pv += Number(item[0]);
            ip += Number(item[1]);
            bounce += Number(item[2]);
            avgTime += Number(item[3]);
        });

        console.log(count, bounce, avgTime);

        setStats({ pv, ip, bounce: bounce / count, avgTime: formatTime(avgTime / count) })
    };

    useEffect(() => {
        getDataList();
    }, []);

    return (
        <>
            <Title value="数据可视化" />

            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                <CardDataStats title="今日访客" total={stats.pv + ''} rate="0.43%" levelUp>
                    <AiOutlineEye className="fill-primary dark:fill-white text-2xl" />
                </CardDataStats>

                <CardDataStats title="今日IP" total={stats.ip + ''} rate="0.95%" levelDown>
                    <AiOutlineMeh className="fill-primary dark:fill-white text-2xl" />
                </CardDataStats>

                <CardDataStats title="跳出率" total={stats.bounce + '%'} rate="4.35%" levelUp>
                    <AiOutlineStock className="fill-primary dark:fill-white text-2xl" />
                </CardDataStats>

                <CardDataStats title="平均访问时长" total={stats.avgTime} rate="2.59%" levelUp>
                    <AiOutlineFieldTime className="fill-primary dark:fill-white text-2xl" />
                </CardDataStats>
            </div>

            <div className="rounded-lg mt-2 grid grid-cols-12 gap-2">
                <VisitorsStatisChat />
                <ChartTwo />
                <ChartThree />
                <MapOne />

                <div className="col-span-12 xl:col-span-8">
                    <TableOne />
                </div>

                <ChatCard />
            </div>
        </>
    )
}