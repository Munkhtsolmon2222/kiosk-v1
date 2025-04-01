"use client";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import DOMPurify from "dompurify";
import { useProducts } from "../../../providers/productContext";

export function Page2({ product, setPage }: any) {
	const [orderProducts, setOrderProducts] = useState(1);
	const images = product?.images || [];
	const [variationsProduct, setVariationsProduct] = useState<any>([]);
	const [selectedVariation, setSelectedVariation] = useState<any>(null);
	const { data, isLoading, error } = useProducts();
	const minusCount = () => {
		setOrderProducts((prev) => (prev > 1 ? prev - 1 : 1));
	};

	const plusCount = () => {
		setOrderProducts((prev) => prev + 1);
	};

	useEffect(() => {
		if (!product?.id || !product.variations?.length) return;

		const fetchVariations = async () => {
			try {
				const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
				const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
				const authHeader = btoa(`${consumerKey}:${consumerSecret}`);

				const res = await fetch(
					`https://erchuudiindelguur.mn/wp-json/wc/v3/products/${product.id}/variations`,
					{
						headers: { Authorization: `Basic ${authHeader}` },
					}
				);
				if (!res.ok) throw new Error("Failed to fetch variations");

				const resJson = await res.json();
				setVariationsProduct(resJson);
				setSelectedVariation(resJson[0]); // Default to first variation
			} catch (error) {
				console.error("Error fetching variations:", error);
			}
		};

		fetchVariations();
	}, [product]);

	const handleVariationClick = (variation: any) => {
		setSelectedVariation(variation);
	};
	const reversedVariations = [...(variationsProduct || [])].reverse();
	// Ensure bigData is always an array
	const bigData = data?.pages.flatMap((page) => page.data) || []; // ✅ Fix applied
	const dataSpread = [...bigData];
	console.log(product);
	return (
		<div>
			<div className="flex justify-end">
				<DialogClose asChild>
					<Button
						variant="outline"
						className="text-center text-white p-2 bg-[#ab3030] w-10 rounded-sm"
					>
						X
					</Button>
				</DialogClose>
			</div>
			<DialogHeader>
				<DialogTitle className="text-3xl font-bold">
					Нэмэлт мэдээлэл
				</DialogTitle>
			</DialogHeader>
			{product?.variations.length > 0 && variationsProduct.length > 0 ? (
				<div className="text-xl mt-4 px-4 w-full text-center">
					<p className="text-gray-600 mt-4">Төрөл</p>
					<div className="flex justify-center gap-6 p-5">
						{reversedVariations.map((variation: any, index: any) => (
							<div
								key={index}
								onClick={() => handleVariationClick(variation)}
								className={`flex flex-col items-center cursor-pointer ${
									selectedVariation?.id === variation.id
										? "border-2 border-blue-500 p-2 rounded-lg"
										: ""
								}`}
							>
								<p className="text-sm">{variation.name || "Төрөл"}</p>
								<img
									className="h-16 w-16 rounded-full"
									src={variation.image?.src || "./zurag.png"}
									alt={variation.name || "Variation"}
								/>
							</div>
						))}
					</div>
					<div
						className="product-description w-full p-4 font-medium text-[14px] overflow-y-auto max-h-[500px]"
						dangerouslySetInnerHTML={{
							__html: DOMPurify.sanitize(selectedVariation?.description || ""),
						}}
					/>
				</div>
			) : (
				<div></div>
			)}

			{/* Keep all other parts of your code unchanged */}
			{/* Product Image Slider */}
			<Swiper
				spaceBetween={10}
				slidesPerView={1}
				loop={true}
				pagination={{ clickable: true }}
				navigation={true}
				modules={[Pagination, Navigation, Autoplay]}
				autoplay={{
					delay: 2000,
					disableOnInteraction: false,
				}}
				className="w-full flex justify-center"
			>
				{images.map((image: any, index: any) => (
					<SwiperSlide key={index}>
						<img
							src={image.src}
							alt={`Product Image ${index + 1}`}
							className="rounded-lg w-[200px] h-[200px] object-contain bg-cover mx-auto"
						/>
					</SwiperSlide>
				))}
			</Swiper>

			{/* Counter for quantity */}
			<div className="border-4 border-[#ab3030] mx-auto px-8 flex gap-10 py-2 rounded-[15px]">
				<button onClick={minusCount} className="text-5xl text-[#ab3030]">
					-
				</button>
				<span className="text-5xl text-[#ab3030]">{orderProducts}</span>
				<button onClick={plusCount} className="text-5xl text-[#ab3030]">
					+
				</button>
			</div>
			<div>
				<p className=" text-xl text-center ">
					Хэрвээ та галзуу бэлгийн харилцааг хүсэж байвал дараах бараануудыг
					сонирхоод үзээрэй !!!
				</p>
				<p className="text-2xl text-[#a3554b]">Хослуулж хэргэлвэл гал гарна</p>

				<div className=" overflow-y-auto mt-2 h-[400px] ">
					{" "}
					{/* display the upsell products */}
					{product?.upsell_ids.length > 0 ? (
						<div className="flex flex-col gap-4 mt-4">
							{product?.upsell_ids.map((upsell_id: any) =>
								dataSpread
									?.filter((product) => product.id == upsell_id)
									.map((upsell: any) => (
										<div key={upsell.id} className="flex gap-4 items-center">
											<img
												className="h-16 w-16 rounded-2xl"
												src={upsell.images?.[0]?.src || "zurag.png"}
												alt={upsell.name}
											/>
											<div>
												<p>{upsell.name}</p>
												<span className="text-2xl block">
													(
													{new Intl.NumberFormat("mn-MN").format(
														upsell.regular_price
													)}
													₮)
												</span>
											</div>
											<div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
												<button
													onClick={minusCount}
													className="text-2xl text-[#ab3030]"
												>
													-
												</button>
												<span className="text-2xl text-[#ab3030]">
													{orderProducts}
												</span>
												<button
													onClick={plusCount}
													className="text-2xl text-[#ab3030]"
												>
													+
												</button>
											</div>
										</div>
									))
							)}
						</div>
					) : (
						<div></div>
					)}
				</div>
			</div>

			{/* Buttons for navigation */}
			<div className="flex justify-between mt-10 w-2/3 mx-auto">
				<Button
					variant="outline"
					className="text-2xl px-8 py-4"
					onClick={() => setPage(1)}
				>
					Буцах
				</Button>
				<Button
					onClick={() => setPage(3)}
					className="text-2xl px-8 py-4 bg-blue-500 text-white"
				>
					Сагсанд хийх
				</Button>
			</div>
		</div>
	);
}
