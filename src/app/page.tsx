"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ─────────── types ─────────── */
type Tab = "driver" | "shipper";
type DriverStep = 0 | 1 | 2 | 3 | 4;

/* ─────────── constants ─────────── */
const APPOINTMENT_MIN = 20; // 10:00 = minute 20 from 9:40
const LOADING_START_MIN = 65; // 10:45
const DEPARTURE_MIN = 110; // 11:30

const UNIT_WAIT = 3800; // ¥/h
const UNIT_EXTRA = 3600; // ¥/h
const WAIT_MINUTES = 45; // 10:00~10:45
const EXTRA_MINUTES = 25; // 11:05~11:30
const WAIT_COST = Math.round((UNIT_WAIT / 60) * WAIT_MINUTES);
const EXTRA_COST = Math.round((UNIT_EXTRA / 60) * EXTRA_MINUTES);
const TOTAL_COST = WAIT_COST + EXTRA_COST;

function minuteToTime(min: number): string {
  const totalMin = min + 40; // offset from 9:00
  const h = 9 + Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

function formatYen(n: number): string {
  return `¥${n.toLocaleString()}`;
}

/* ─────────── main ─────────── */
export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("driver");
  const [driverStep, setDriverStep] = useState<DriverStep>(0);
  const [elapsedMin, setElapsedMin] = useState(0);
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(
    new Set(["手降ろし・仕分け"])
  );
  const [isSent, setIsSent] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [shipperOpened, setShipperOpened] = useState(false);
  const [driverOpenedAfterConfirm, setDriverOpenedAfterConfirm] =
    useState(false);

  const [tabBlinking, setTabBlinking] = useState<Tab | null>(null);
  const [sendButtonPressed, setSendButtonPressed] = useState(false);
  const [confirmButtonPressed, setConfirmButtonPressed] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setElapsedMin((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (driverStep === 1 && elapsedMin >= LOADING_START_MIN) {
      stopTimer();
      setElapsedMin(LOADING_START_MIN);
      setDriverStep(2);
      startTimer();
    }
    if (driverStep === 2 && elapsedMin >= DEPARTURE_MIN) {
      stopTimer();
      setElapsedMin(DEPARTURE_MIN);
      setDriverStep(3);
    }
  }, [elapsedMin, driverStep, stopTimer, startTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "shipper" && isSent && !shipperOpened) {
      setShipperOpened(true);
    }
    if (tab === "driver" && isConfirmed && !driverOpenedAfterConfirm) {
      setDriverOpenedAfterConfirm(true);
    }
  };

  const triggerBlink = (tab: Tab) => {
    setTabBlinking(tab);
    setTimeout(() => setTabBlinking(null), 1000);
  };

  const handleArrive = () => {
    setDriverStep(1);
    setElapsedMin(0);
    startTimer();
  };

  const handleFastForwardWait = () => {
    stopTimer();
    setElapsedMin(LOADING_START_MIN);
    setDriverStep(2);
    startTimer();
  };

  const handleFastForwardLoading = () => {
    stopTimer();
    setElapsedMin(DEPARTURE_MIN);
    setDriverStep(3);
  };

  const handleSend = () => {
    setSendButtonPressed(true);
    setTimeout(() => {
      setIsSent(true);
      setDriverStep(4);
      triggerBlink("shipper");
    }, 300);
  };

  const handleConfirm = () => {
    setConfirmButtonPressed(true);
    setTimeout(() => {
      setIsConfirmed(true);
      triggerBlink("driver");
    }, 300);
  };

  const handleReset = () => {
    stopTimer();
    setActiveTab("driver");
    setDriverStep(0);
    setElapsedMin(0);
    setSelectedExtras(new Set(["手降ろし・仕分け"]));
    setIsSent(false);
    setIsConfirmed(false);
    setShipperOpened(false);
    setDriverOpenedAfterConfirm(false);
    setSendButtonPressed(false);
    setConfirmButtonPressed(false);
    setTabBlinking(null);
  };

  const toggleExtra = (item: string) => {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const progressPct =
    driverStep === 0
      ? 0
      : driverStep === 1
        ? 20
        : driverStep === 2
          ? 50
          : driverStep === 3
            ? 75
            : 100;

  const shipperTabActive = isSent;
  const driverTabHighlight = isConfirmed;
  const showGoToShipper = isSent && driverStep === 4;
  const goToShipperPulse = showGoToShipper && !shipperOpened;
  const showGoToDriver = isConfirmed && activeTab === "shipper";
  const goToDriverPulse = showGoToDriver && !driverOpenedAfterConfirm;

  return (
    <div className="flex flex-col h-dvh max-w-[430px] mx-auto w-full">
      {/* ════════ TABS ════════ */}
      <div className="flex shrink-0 h-14 relative z-10">
        <button
          onClick={() => switchTab("driver")}
          className="flex-1 flex items-center justify-center text-base font-bold transition-colors duration-300 relative"
          style={{
            backgroundColor:
              activeTab === "driver"
                ? "#1B2A41"
                : driverTabHighlight
                  ? "#1B2A41"
                  : "#E5E7EB",
            color:
              activeTab === "driver"
                ? "#FFFFFF"
                : driverTabHighlight
                  ? "#FFFFFF"
                  : "#6B7280",
            animation:
              tabBlinking === "driver"
                ? "blink-tab 0.5s ease-in-out 2"
                : "none",
          }}
        >
          ドライバー
          {isConfirmed && !driverOpenedAfterConfirm && (
            <span className="absolute top-2 right-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[11px] text-white font-bold">
              1
            </span>
          )}
        </button>
        <button
          onClick={() => switchTab("shipper")}
          className="flex-1 flex items-center justify-center text-base font-bold transition-colors duration-300 relative"
          style={{
            backgroundColor:
              activeTab === "shipper"
                ? shipperTabActive
                  ? "#0E7C86"
                  : "#9CA3AF"
                : shipperTabActive
                  ? "#0E7C86"
                  : "#E5E7EB",
            color:
              activeTab === "shipper"
                ? "#FFFFFF"
                : shipperTabActive
                  ? "#FFFFFF"
                  : "#9CA3AF",
            animation:
              tabBlinking === "shipper"
                ? "blink-tab 0.5s ease-in-out 2"
                : "none",
          }}
        >
          荷主
          {isSent && !shipperOpened && (
            <span className="absolute top-2 right-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[11px] text-white font-bold">
              1
            </span>
          )}
        </button>
      </div>

      {/* ════════ CONTENT ════════ */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeTab === "driver" ? (
          <DriverView
            step={driverStep}
            elapsedMin={elapsedMin}
            selectedExtras={selectedExtras}
            sendButtonPressed={sendButtonPressed}
            progressPct={progressPct}
            showGoToShipper={showGoToShipper}
            goToShipperPulse={goToShipperPulse}
            onArrive={handleArrive}
            onFastForwardWait={handleFastForwardWait}
            onFastForwardLoading={handleFastForwardLoading}
            onToggleExtra={toggleExtra}
            onSend={handleSend}
            onGoToShipper={() => switchTab("shipper")}
          />
        ) : (
          <ShipperView
            isSent={isSent}
            isConfirmed={isConfirmed}
            confirmButtonPressed={confirmButtonPressed}
            showGoToDriver={showGoToDriver}
            goToDriverPulse={goToDriverPulse}
            onConfirm={handleConfirm}
            onReset={handleReset}
            onGoToDriver={() => switchTab("driver")}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DRIVER VIEW
   ═══════════════════════════════════════════════ */
function DriverView({
  step,
  elapsedMin,
  selectedExtras,
  sendButtonPressed,
  progressPct,
  showGoToShipper,
  goToShipperPulse,
  onArrive,
  onFastForwardWait,
  onFastForwardLoading,
  onToggleExtra,
  onSend,
  onGoToShipper,
}: {
  step: DriverStep;
  elapsedMin: number;
  selectedExtras: Set<string>;
  sendButtonPressed: boolean;
  progressPct: number;
  showGoToShipper: boolean;
  goToShipperPulse: boolean;
  onArrive: () => void;
  onFastForwardWait: () => void;
  onFastForwardLoading: () => void;
  onToggleExtra: (item: string) => void;
  onSend: () => void;
  onGoToShipper: () => void;
}) {
  return (
    <div className="flex flex-col min-h-full">
      {/* header */}
      <div className="bg-navy px-5 pt-4 pb-5">
        <h1 className="text-xl font-bold text-white">
          {step < 3 ? "現場レシート" : step === 3 ? "出発前の確認" : "送信完了"}
        </h1>
        <p className="text-sm text-[#9EDDE3] mt-1">
          ◯◯物流センター　3番バース
        </p>
      </div>

      {/* progress bar */}
      {step > 0 && (
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      <div className="flex-1 px-4 pt-4 pb-6 space-y-4">
        {step === 0 && <Step0 onArrive={onArrive} />}
        {step === 1 && (
          <Step1 elapsedMin={elapsedMin} onFastForward={onFastForwardWait} />
        )}
        {step === 2 && (
          <Step2
            elapsedMin={elapsedMin}
            onFastForward={onFastForwardLoading}
          />
        )}
        {step === 3 && (
          <Step3
            selectedExtras={selectedExtras}
            sendButtonPressed={sendButtonPressed}
            onToggleExtra={onToggleExtra}
            onSend={onSend}
          />
        )}
        {step === 4 && <Step4 />}
      </div>

      {showGoToShipper && (
        <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <GoToButton
            label="荷主の画面を見る"
            color="#0E7C86"
            pulse={goToShipperPulse}
            onClick={onGoToShipper}
          />
        </div>
      )}
    </div>
  );
}

/* ── Step 0 ── */
function Step0({ onArrive }: { onArrive: () => void }) {
  return (
    <div className="flex flex-col gap-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {/* 説明カード */}
      <Card>
        <h2 className="text-[20px] font-bold text-ink mb-2">
          「現場レシート」を体験する
        </h2>
        <p className="text-base text-ink leading-relaxed">
          トラックドライバーの1回の配送が、そのまま請求の根拠になるまでを体験できます。
        </p>
      </Card>

      {/* 3ステップ予告 */}
      <div className="flex flex-col gap-2 px-1">
        {[
          { n: "1", label: "待つ" },
          { n: "2", label: "契約外の作業を選ぶ" },
          { n: "3", label: "荷主の画面を見る" },
        ].map((s) => (
          <div key={s.n} className="flex items-center gap-2">
            <span className="shrink-0 w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
              {s.n}
            </span>
            <span className="text-sm text-ink">{s.label}</span>
          </div>
        ))}
      </div>

      {/* 設定カード */}
      <div className="bg-tint rounded-[14px] px-4 py-4">
        <p className="text-sm font-bold text-accent-dark mb-2">
          ここからデモです
        </p>
        <p className="text-lg text-ink leading-relaxed">
          あなたはトラックドライバーです。
          <br />
          ◯◯物流センターに、10時の約束で荷物を届けにきました。
        </p>
        <p className="text-2xl font-bold text-ink mt-2">
          今は9時40分。20分早く着きました。
        </p>
      </div>

      {/* 到着ボタン */}
      <button
        onClick={onArrive}
        className="w-full h-[72px] rounded-xl bg-navy text-white text-lg font-bold active:scale-95 transition-transform duration-150"
      >
        到着した
      </button>
    </div>
  );
}

/* ── Step 1 ── */
function Step1({
  elapsedMin,
  onFastForward,
}: {
  elapsedMin: number;
  onFastForward: () => void;
}) {
  const currentTime = minuteToTime(elapsedMin);
  const isPastAppointment = elapsedMin >= APPOINTMENT_MIN;
  const waitMin = isPastAppointment ? elapsedMin - APPOINTMENT_MIN : 0;

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-muted mb-1">現在時刻</p>
        <p className="text-[40px] font-bold text-ink leading-none">
          {currentTime}
        </p>
      </Card>

      {!isPastAppointment ? (
        <Card>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted">早着</span>
            <span className="text-2xl font-bold text-muted">
              {elapsedMin}分
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            この時間は待機に数えません
          </p>
        </Card>
      ) : (
        <Card className="border-2 border-accent">
          <p className="text-xs font-bold text-accent mb-1">
            有責待機
            <span className="font-normal text-muted ml-2">
              荷主側の都合で待たされた時間
            </span>
          </p>
          <p className="text-[40px] font-bold text-ink leading-none">
            {waitMin}分
          </p>
        </Card>
      )}

      <button
        onClick={onFastForward}
        className="w-full h-12 rounded-xl bg-gray-200 text-ink font-bold text-base active:bg-gray-300"
      >
        早送りする（10:45へ）
      </button>
    </div>
  );
}

/* ── Step 2 ── */
function Step2({
  elapsedMin,
  onFastForward,
}: {
  elapsedMin: number;
  onFastForward: () => void;
}) {
  const loadingMin = elapsedMin - LOADING_START_MIN;
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-bold text-navy mb-1">荷役が始まりました</p>
        <p className="text-sm text-muted mb-3">荷物の積み降ろし作業中です</p>
        <p className="text-sm text-muted">経過時間</p>
        <p className="text-[40px] font-bold text-ink leading-none">
          {loadingMin}分
        </p>
      </Card>
      <button
        onClick={onFastForward}
        className="w-full h-12 rounded-xl bg-gray-200 text-ink font-bold text-base active:bg-gray-300"
      >
        早送りする（11:30へ）
      </button>
    </div>
  );
}

/* ── Step 3 ── */
function Step3({
  selectedExtras,
  sendButtonPressed,
  onToggleExtra,
  onSend,
}: {
  selectedExtras: Set<string>;
  sendButtonPressed: boolean;
  onToggleExtra: (item: string) => void;
  onSend: () => void;
}) {
  const options = [
    { label: "手降ろし・仕分け", ai: true },
    { label: "検品・棚入れ", ai: false },
    { label: "積み忘れで戻された", ai: false },
    { label: "契約外の作業はなかった", ai: false },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-baseline mb-3">
          <p className="text-sm font-bold text-navy">自動で記録しました</p>
          <p className="text-xs text-muted">入力不要</p>
        </div>
        <div className="space-y-2 text-base text-ink">
          <div className="flex justify-between">
            <span>到着</span>
            <span className="font-bold">9:40</span>
          </div>
          <div className="flex justify-between">
            <span>荷役開始</span>
            <span className="font-bold">10:45</span>
          </div>
          <div className="flex justify-between">
            <span>出発</span>
            <span className="font-bold">11:30</span>
          </div>
        </div>
        <p className="text-xs text-muted mt-3">
          ジオフェンス／リアドア開閉／荷台重量
        </p>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center w-8 h-5 rounded-full bg-accent text-white text-[10px] font-bold">
            AI
          </span>
          <span className="text-xs text-accent-dark leading-tight">
            11:05〜11:30 に荷台の重量が段階的に減っています
          </span>
        </div>
        <h2 className="text-lg font-bold text-navy mb-1">
          契約にない作業はありましたか？
        </h2>
        <p className="text-xs text-muted mb-4">
          契約：パレット降ろしまで。以下は契約に含まれない項目です
        </p>

        <div className="space-y-2">
          {options.map((opt) => {
            const selected = selectedExtras.has(opt.label);
            return (
              <button
                key={opt.label}
                onClick={() => onToggleExtra(opt.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                  selected
                    ? "bg-tint border-accent"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <span
                  className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                    selected
                      ? "bg-accent text-white"
                      : "border-2 border-gray-300"
                  }`}
                >
                  {selected && <CheckIcon size={12} />}
                </span>
                <span
                  className={`flex-1 text-base ${
                    selected ? "font-bold text-accent-dark" : "text-ink"
                  }`}
                >
                  {opt.label}
                </span>
                {opt.ai && (
                  <span className="text-xs text-accent-dark">AI候補</span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="bg-navy rounded-xl px-4 py-4">
        <p className="text-xs text-[#C7D0DD] mb-1">このまま送ると</p>
        <p className="text-base font-bold text-white">
          有責待機 45分 ＋ 契約外作業 25分
        </p>
        <p className="text-xs text-[#9EDDE3] mt-1">
          荷主にも同時に届きます。時刻の修正はできません
        </p>
      </div>

      <div className="pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <BigButton
          label={sendButtonPressed ? "✓ 送信しました" : "この内容で送る"}
          color={sendButtonPressed ? "#0A5C63" : "#0E7C86"}
          onClick={onSend}
          disabled={sendButtonPressed}
          pressed={sendButtonPressed}
        />
      </div>
    </div>
  );
}

/* ── Step 4 ── */
function Step4() {
  return (
    <div className="space-y-4">
      <Card className="border-2 border-accent">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center">
            <CheckIcon size={14} />
          </span>
          <span className="text-base font-bold text-accent-dark">
            送りました
          </span>
        </div>
        <div className="space-y-2 text-base">
          <div className="flex justify-between">
            <span className="text-ink">
              有責待機
              <span className="text-xs text-muted ml-1">
                荷主側の都合で待たされた時間
              </span>
            </span>
            <span className="font-bold text-ink">45分</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink">契約外作業</span>
            <span className="font-bold text-ink">25分</span>
          </div>
        </div>
      </Card>
      <p className="text-sm text-muted text-center">
        荷主にも同じ内容が届いています
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SHIPPER VIEW
   ═══════════════════════════════════════════════ */
function ShipperView({
  isSent,
  isConfirmed,
  confirmButtonPressed,
  showGoToDriver,
  goToDriverPulse,
  onConfirm,
  onReset,
  onGoToDriver,
}: {
  isSent: boolean;
  isConfirmed: boolean;
  confirmButtonPressed: boolean;
  showGoToDriver: boolean;
  goToDriverPulse: boolean;
  onConfirm: () => void;
  onReset: () => void;
  onGoToDriver: () => void;
}) {
  if (!isSent) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-[#9CA3AF] px-5 pt-4 pb-5">
          <h1 className="text-xl font-bold text-white">現場レシート</h1>
          <p className="text-sm text-gray-200 mt-1">受信した記録を確認</p>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-2">
            <p className="text-5xl font-bold text-gray-300">0件</p>
            <p className="text-base text-muted">本日の未確認レシート</p>
          </div>
        </div>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-accent px-5 pt-4 pb-5">
          <h1 className="text-xl font-bold text-white">現場レシート</h1>
          <p className="text-sm text-[#9EDDE3] mt-1">確定済み</p>
        </div>
        <div className="flex-1 px-4 pt-6 pb-6 space-y-5">
          <Card className="border-2 border-accent">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center">
                <CheckIcon size={14} />
              </span>
              <span className="text-lg font-bold text-accent-dark">
                確定 {formatYen(TOTAL_COST)}
              </span>
            </div>
          </Card>

          <div className="space-y-4 text-base text-ink leading-relaxed">
            <p>
              待った<span className="font-bold">45分</span>と、契約になかった
              <span className="font-bold">25分</span>が、金額になりました。
            </p>
            <p className="text-muted">
              今はこの時間、記録も請求もされていません。
            </p>
            <p className="font-bold">
              2027年4月、国が「契約外」を規制します。
              <br />
              測る道具を、間に合わせたい。
            </p>
          </div>

          <div className="pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <BigButton
              label="もう一度やる"
              color="#1B2A41"
              onClick={onReset}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-accent px-5 pt-4 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">現場レシート</h1>
            <p className="text-xs text-[#9EDDE3] mt-1">
              No. 2036-0917-0412 ｜ 2036/09/17
            </p>
          </div>
          <span className="mt-1 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white">
            確認待ち
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-6 space-y-3">
        <Card>
          <p className="text-base font-bold text-navy mb-1">
            ◯◯物流センター　3番バース
          </p>
          <p className="text-xs text-muted">
            運送会社：△△運輸　　車両：品川 100 あ 12-34
          </p>
          <p className="text-xs text-muted">
            契約：到着 10:00 ／ パレット降ろしまで
          </p>
        </Card>

        <Card>
          <div className="flex justify-between items-baseline mb-3">
            <p className="text-sm font-bold text-navy">現場の記録</p>
            <p className="text-xs text-muted">センサー自動</p>
          </div>
          <TimelineBar />
          <p className="text-xs text-accent-dark mt-2">
            早着分（9:40〜10:00）は待機に含めていません
          </p>
        </Card>

        <Card>
          <div className="flex justify-between items-baseline mb-3">
            <p className="text-sm font-bold text-navy">契約との差分</p>
            <p className="text-xs text-muted">単価：契約書面より</p>
          </div>
          <div className="border-t border-gray-200 pt-3 space-y-3">
            <CostRow
              label="有責待機"
              sub="10:00〜10:45"
              minutes={WAIT_MINUTES}
              cost={WAIT_COST}
            />
            <div className="border-t border-gray-100" />
            <CostRow
              label="契約外作業"
              sub="手降ろし・仕分け　11:05〜11:30"
              minutes={EXTRA_MINUTES}
              cost={EXTRA_COST}
            />
            <div className="border-t border-gray-200" />
            <div className="flex justify-between items-baseline">
              <span className="text-base font-bold text-navy">合計</span>
              <span className="text-2xl font-bold text-ink">
                {formatYen(TOTAL_COST)}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-muted mt-2">
            待機 {formatYen(UNIT_WAIT)}/時 ／ 附帯 {formatYen(UNIT_EXTRA)}
            /時 で算出
          </p>
        </Card>

        <div className="bg-tint rounded-xl px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="shrink-0 inline-flex items-center justify-center w-8 h-5 rounded-full bg-accent text-white text-[10px] font-bold mt-0.5">
              AI
            </span>
            <div className="text-xs text-accent-dark space-y-1">
              <p>荷台重量の変化から「手降ろし・仕分け」を候補提示</p>
              <p>ドライバー確認済み ✓（11:31 1タップ）</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted text-center">
          ドライバーが選んだ内容が、そのまま届いています
        </p>

        <Card>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
                <CheckIcon size={10} />
              </span>
              <span className="text-sm text-ink">
                運送会社　確認済み　09/17 11:35
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full border-2 border-gray-300" />
              <span className="text-sm text-ink">荷主　未確認</span>
            </div>
          </div>
          <p className="text-xs font-bold text-amber-700 mt-2">
            残り 23時間58分 で確定（異議がない場合）
          </p>
        </Card>

        <div className="pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <BigButton
            label={
              confirmButtonPressed
                ? "✓ 確定 " + formatYen(TOTAL_COST)
                : "確認する"
            }
            color={confirmButtonPressed ? "#0A5C63" : "#0E7C86"}
            onClick={onConfirm}
            disabled={confirmButtonPressed}
            pressed={confirmButtonPressed}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════ */

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-[14px] px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

function BigButton({
  label,
  color,
  onClick,
  disabled = false,
  pressed = false,
}: {
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-14 rounded-xl text-white text-base font-bold transition-transform duration-150 ${
        pressed ? "scale-95" : "active:scale-95"
      }`}
      style={{ backgroundColor: color }}
    >
      {label}
    </button>
  );
}

function GoToButton({
  label,
  color,
  pulse,
  onClick,
}: {
  label: string;
  color: string;
  pulse: boolean;
  onClick: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <button
      onClick={onClick}
      className="w-full h-[72px] rounded-xl text-white text-lg font-bold transition-all duration-300"
      style={{
        backgroundColor: revealed ? color : "#9CA3AF",
        animation: pulse ? "pulse-slow 1.5s ease-in-out infinite" : "none",
      }}
    >
      {label}
    </button>
  );
}

function TimelineBar() {
  const total = 110;
  const earlyW = (20 / total) * 100;
  const waitW = (45 / total) * 100;
  const loadW = (20 / total) * 100;
  const extraW = (25 / total) * 100;

  return (
    <div>
      <div className="flex h-8 rounded-lg overflow-hidden text-[10px] font-bold">
        <div
          className="bg-gray-300 flex items-center justify-center text-gray-600"
          style={{ width: `${earlyW}%` }}
        >
          早着
        </div>
        <div
          className="bg-accent flex items-center justify-center text-white"
          style={{ width: `${waitW}%` }}
        >
          有責待機 45分
        </div>
        <div
          className="bg-navy flex items-center justify-center text-white"
          style={{ width: `${loadW}%` }}
        >
          荷役
        </div>
        <div
          className="bg-accent flex items-center justify-center text-white"
          style={{ width: `${extraW}%` }}
        >
          契約外 25分
        </div>
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-muted">
        <span>9:40</span>
        <span>10:00</span>
        <span>10:45</span>
        <span>11:30</span>
      </div>
    </div>
  );
}

function CostRow({
  label,
  sub,
  minutes,
  cost,
}: {
  label: string;
  sub: string;
  minutes: number;
  cost: number;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <div>
        <p className="text-sm text-ink">{label}</p>
        <p className="text-[10px] text-muted">{sub}</p>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-xl font-bold text-accent">{minutes}分</span>
        <span className="text-base font-bold text-ink">{formatYen(cost)}</span>
      </div>
    </div>
  );
}

function CheckIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
