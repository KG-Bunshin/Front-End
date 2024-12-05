'use client';

import { ChevronDownIcon, MapPinIcon, SearchIcon, Slash } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import CustomCard from '@/components/custom-card';
import {
  NumberParam,
  StringParam,
  useQueryParam,
  withDefault,
} from 'use-query-params';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Category,
  CityChip,
  PlaceSearch,
  ResponseList,
  SearchSchema,
} from '@/components/type';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  constructSearchPlacesQuery,
  fetchImageFromWikidata,
  getAllCategory,
  getAllCity,
} from '@/lib/query';
import { extractEntityFromURL, getCategoryImage } from '@/lib/utils';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function Search() {
  const [placesImage, setPlacesImage] = useState<string[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const [page, setPage] = useQueryParam('page', withDefault(NumberParam, 1));

  const [place, setPlace] = useQueryParam(
    'place',
    withDefault(StringParam, '')
  );

  const [category, setCategory] = useQueryParam(
    'category',
    withDefault(StringParam, '')
  );

  const [city, setCity] = useQueryParam('city', withDefault(StringParam, ''));

  const {
    data: places,
    refetch,
    isLoading: loadingPlaces,
    error: errorPlaces,
  } = useQuery<ResponseList<PlaceSearch>>({
    queryKey: ['places'],
    queryFn: async () => {
      const response = await axios.post(`/api/sparql`, {
        query: constructSearchPlacesQuery({ category, city, place, page }),
      });

      return response.data;
    },
  });

  useEffect(() => {
    const fetchImagePlace = async () => {
      if (!places?.results?.bindings?.length) return;

      const imageUrls = await Promise.all(
        places.results.bindings.map(async (place) => {
          if (place.sameAs) {
            const entityId = extractEntityFromURL(place.sameAs.value);
            const imageURL = await fetchImageFromWikidata(entityId);
            if (imageURL) {
              return imageURL;
            } else {
              return getCategoryImage(place.categoryLabel.value);
            }
          } else {
            return getCategoryImage(place.categoryLabel.value);
          }
        })
      );

      setPlacesImage(imageUrls);
    };

    fetchImagePlace();
  }, [places]);

  const {
    data: cities,
    isLoading: loadingCities,
    error: errorCities,
  } = useQuery<ResponseList<CityChip>>({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await axios.post(`/api/sparql`, {
        query: getAllCity,
      });

      return response.data;
    },
  });

  const {
    data: categories,
    isLoading: loadingCategories,
    error: errorCategories,
  } = useQuery<ResponseList<Category>>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.post(`/api/sparql`, {
        query: getAllCategory,
      });

      return response.data;
    },
  });

  const form = useForm<z.infer<typeof SearchSchema>>({
    resolver: zodResolver(SearchSchema),
    mode: 'all',
    defaultValues: {
      place: place,
    },
  });

  function onSubmit(data: z.infer<typeof SearchSchema>) {
    setPlace(data.place);
  }

  useEffect(() => {
    refetch();
    setPage(1);
  }, [place, category, city]);

  useEffect(() => {
    refetch();
  }, [page]);

  const handlePrevious = (): void => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  const renderPageLinks = () => {
    const pages = [];
    let startPage, endPage;

    if (page <= 2) {
      // Show the first few pages without ellipsis
      startPage = 1;
      endPage = 3;
    } else {
      // General case: current page in the middle
      startPage = page - 1;
      endPage = page + 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={i === page}
            onClick={(e) => {
              e.preventDefault();
              setPage(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <main className="min-h-screen bg-gray-100 space-y-5">
      <div className="w-full h-20 bg-white px-[100px] 2xl:px-[300px] flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">KG Bunshin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/search`}>Search</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex gap-10">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-gray-100 text-black text-lg">
                <MapPinIcon />
                <p>Pilih Kota</p>
                <ChevronDownIcon />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader className="mb-3">
                <DialogTitle className="font-bold text-xl text-center">
                  Pilih Kota Destinasi
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap gap-5 overflow-auto">
                {cities &&
                  cities.results.bindings.length > 0 &&
                  cities.results.bindings.map((cityData, idx) => (
                    <Badge
                      variant={
                        city == extractEntityFromURL(cityData.resource.value)
                          ? 'default'
                          : 'outline'
                      }
                      className="text-base cursor-pointer"
                      key={idx}
                      onClick={() => {
                        if (
                          city == extractEntityFromURL(cityData.resource.value)
                        ) {
                          setCity('');
                        } else {
                          setCity(
                            extractEntityFromURL(cityData.resource.value)
                          );
                        }
                        setOpen(false);
                      }}
                    >
                      {extractEntityFromURL(cityData.resource.value)}
                    </Badge>
                  ))}
              </div>
            </DialogContent>
          </Dialog>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="place"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex ring-2 rounded-2xl relative ring-white ring-opacity-50 w-[500px]">
                        <SearchIcon className="absolute top-2 left-2" />
                        <Input
                          className="rounded-r-none rounded-l-2xl pl-10"
                          placeholder="Cari destinasi"
                          {...field}
                        />
                        <Button
                          className="rounded-l-none rounded-r-2xl bg-blue-500 px-10 font-semibold"
                          type="submit"
                        >
                          Cari
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>

      <div className="w-full px-[100px] 2xl:px-[300px] flex min-h-screen">
        <div className="w-2/12 flex flex-col gap-5">
          <div className="w-full mx-auto bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-800">Kategori</h3>
            <RadioGroup
              defaultValue=""
              className="mt-2 gap-5 text-base"
              onValueChange={(value) => setCategory(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="semua" />
                <Label htmlFor="semua">Semua Kategori</Label>
              </div>
              {categories &&
                categories.results.bindings.length > 0 &&
                categories.results.bindings.map((category, idx) => (
                  <div className="flex items-center space-x-2" key={idx}>
                    <RadioGroupItem
                      value={extractEntityFromURL(category.resource.value)}
                      id={extractEntityFromURL(category.resource.value)}
                    />
                    <Label htmlFor="semua">{category.label.value}</Label>
                  </div>
                ))}
            </RadioGroup>
          </div>
        </div>
        <div className="w-10/12 ml-5 flex flex-col gap-5">
          <div className="w-full grid grid-cols-3 gap-5">
            {places &&
              places.results.bindings.length > 0 &&
              places.results.bindings.map((place, index) => (
                <Link
                  key={index}
                  href={`/page/${extractEntityFromURL(place.resource.value)}`}
                >
                  <CustomCard
                    imageUrl={
                      placesImage[index] != '' ? placesImage[index] : undefined
                    }
                    title={place.label.value}
                    category={place.categoryLabel.value}
                    city={extractEntityFromURL(place.city.value)}
                    ratingValue={place.ratingValue.value}
                    price={
                      place.valuePrice
                        ? place.valuePrice.value == '0.0'
                          ? 'Gratis'
                          : 'Rp ' + place.valuePrice.value
                        : place.valuePriceWeekend
                        ? place.valuePriceWeekend.value == '0.0'
                          ? 'Gratis'
                          : 'Rp ' + place.valuePriceWeekend.value
                        : place.valuePriceWeekday
                        ? place.valuePriceWeekday.value == '0.0'
                          ? 'Gratis'
                          : 'Rp ' + place.valuePriceWeekday.value
                        : 'Tidak Diketahui'
                    }
                  />
                </Link>
              ))}
          </div>
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePrevious();
                    }}
                  />
                </PaginationItem>
              )}
              {page > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {renderPageLinks()}
              {page < 1000 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </main>
  );
}
