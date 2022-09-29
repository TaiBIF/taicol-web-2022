
import React from 'react';
import {
  redCategories,
  citesRefs,
  protectedCategories,
  habitats,
  alienTypes,
  classificationHierarchies
} from './options';
import type { Option, ClassificationOption } from './options'
import AsyncSelect from 'react-select/async';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {advancedSearchFormSchema} from './advancedSearchFormSchema'

type AdvancedSearchFormValues = z.infer<typeof advancedSearchFormSchema>;

const AdvancedSearchForm: React.VFC = () => {
  const [showAdvancedSearch, setShowAdvancedSearch] = React.useState<boolean>(false);
  const [showConditions, setShowConditions] = React.useState<boolean>(false);
  const [showMoreSearchOptions, setShowMoreSearchOptions] = React.useState<boolean>(false);
  const [showClassificationHierarchyOptions, setShowClassificationHierarchyOptions] = React.useState<boolean>(false);
  const [selectedClassificationHierarchies,setSelectedClassificationHierarchies] = React.useState<Option[]>([]);

  const removeRankItem = (value:string) => {
    const newClassificationHierarchy = selectedClassificationHierarchies.filter((item) => item.value !== value);
    setSelectedClassificationHierarchies(newClassificationHierarchy);
  }

	const methods = useForm<AdvancedSearchFormValues>({
		resolver: zodResolver(advancedSearchFormSchema),
  });

	const {
    handleSubmit,
    setValue,
    control,
    getValues,
		formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<AdvancedSearchFormValues> = async (values) => {
    const res = await fetch('/api/admin/category/save', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
  };

  const loadOptions = (inputText:string) => {
    /**
    const len = inputText.length;

    // We need to tell user must input more than 3 characters
    if (len > 0) {
      return UserDataService.getUserList(inputText)
        .then((response) => {
          return response.data.map((user) => ({
            value: user.id,
            label: user.username,
          }));

        })
        .catch((error) => {
          alert(JSON.stringify(error));
        });
    }
     */
  };
  return <div className="more-selection-area">
    <div className={`select-button ${showAdvancedSearch ? 'now' : ''}`}>
      <div className="main-box">
        <p>進階選項</p>
        <div className="arr" onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20.828" height="11.828" viewBox="0 0 20.828 11.828">
            <g id="tree-arr" transform="translate(-1545.086 -550.086)">
              <line id="Line_177" data-name="Line 177" x2="9" y2="9" transform="translate(1546.5 551.5)" fill="none" stroke="#FFF" stroke-linecap="round" stroke-width="2"></line>
              <line id="Line_178" data-name="Line 178" x1="9" y2="9" transform="translate(1555.5 551.5)" fill="none" stroke="#FFF" stroke-linecap="round" stroke-width="2"></line>
            </g>
          </svg>
        </div>
      </div>
    </div>
    <div className={`selection-box ${showAdvancedSearch ? 'block' : 'hidden'}`}>
				<div className="main-box">
					<form id="moreForm"  onSubmit={handleSubmit(onSubmit)}>
					<div className="option-box1">
						<div className="item-box">
							<div className="left-title">
								<p>較高分類群</p>
							</div>
							<div className="input-item w-[400px]">
                <Controller
                  name="taxon_group"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange} }) => (
                  <AsyncSelect
                      cacheOptions
                      isMulti
                      isClearable
                      loadOptions={(v) => loadOptions(v)}
                      defaultOptions
                      onInputChange={onChange}
                  />
                  )}
                />

							</div>
						</div>
						<div className="item-box">
							<div className="left-title">
								<p>分類階層</p>
							</div>
							<div className="right-option">
								<div className="input-item select-170" onClick={() => setShowClassificationHierarchyOptions(!showClassificationHierarchyOptions)}>
                    <div className={`w-40 nice-select wide ${showClassificationHierarchyOptions ? 'open' : ''}`} tabIndex={0}>
                    <span className="current"></span>
                    <ul className="list">
                      {classificationHierarchies.map((option: ClassificationOption) => (
                        <li onClick={() => {
                          const selected = [...selectedClassificationHierarchies, option]
                          setSelectedClassificationHierarchies([...selectedClassificationHierarchies, option])
                          const prevValues = getValues('classificationHierarchies') as string[]
                          setValue('classificationHierarchies',[...prevValues, option.value])
                        }} className={`option ${option.bold ? 'font-bold' : ''}`}>{option.label}</li>
                      ))}
                      </ul>
                    </div>
								</div>
                <div className="alread-select">
                  {selectedClassificationHierarchies.map((option: Option) => (
                    <div className="item">
                      <p>{option.label}</p>
                      <button type='button' className="remove-alread-select" onClick={() => removeRankItem(option.value)}>
                        <img src="/images/w-xx.svg"/>
                      </button>
                    </div>
                  ))}
								</div>
							</div>
						</div>
						<div className="item-box check-set">
							<div className="left-title">
								<p>特有性</p>
							</div>
							<div className="right-check">
								<label className="check-item">臺灣特有
									<input type="checkbox" name="is_endemic"/>
									<span className="checkmark"></span>
								</label>
							</div>
						</div>
						<div className="item-box check-set">
							<div className="left-title">
								<p>原生/外來性</p>
							</div>
							<div className="right-check">
								<label className="check-item">原生
									<input type="checkbox" name="alien_type" value="native"/>
									<span className="checkmark"></span>
                </label>
                {alienTypes.map((alienType:Option, index:number) => {
                  return (
                    <label className="check-item" key={index}>{alienType.label}
                      <input type="checkbox" name="alien_type" value={alienType.value} />
                      <span className="checkmark"></span>
                    </label>
                  )
                })}
							</div>
						</div>
						<div className="more-option-button" onClick={() => setShowMoreSearchOptions(!showMoreSearchOptions)}>
							<p>更多項目</p>
							<svg xmlns="http://www.w3.org/2000/svg" width="15.043" height="15.043" viewBox="0 0 15.043 15.043">
								<g id="plussvg" transform="translate(-1553.5 -534.5)">
									<line id="Line_211" data-name="Line 211" x1="13.043" transform="translate(1554.5 542.021)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2"></line>
									<line className="minus" id="Line_213" data-name="Line 213" x1="13.043" transform="translate(1561.021 535.5) rotate(90)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2"></line>
								</g>
							</svg>

						</div>
					</div>
          <div className={`option-box2 ${showMoreSearchOptions ? 'block' : 'hidden'}`}>
            <div className="item-box check-set">
              <div className="left-title">
                <p>棲地環境</p>
              </div>
              <div className="right-check">
                <label className="check-item">陸生
                  <input type="checkbox" name="is_terrestrial" />
                  <span className="checkmark"></span>
                </label>
                {habitats.map((item: Option, index: number) => {
                  return (
                    <label className="check-item" key={`habitat-${index}`}>{item.label}
                      <input type="checkbox" name={item.value} />
                      <span className="checkmark"></span>
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="item-box check-set">
              <div className="left-title">
                <p>保育類</p>
              </div>
              <div className="right-check">
                {protectedCategories.map((item, index) => {
                  return (
                    <label className="check-item" key={`protected-category-${index}`}>{item.label}
                      <input type="checkbox" name="protected_category" value={item.value} />
                      <span className="checkmark"></span>
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="item-box check-set">
              <div className="left-title">
                <p>臺灣紅皮書評估</p>
              </div>
              <div className="right-check">

                <label className="check-item">EX
                  <input type="checkbox" name="red_category" value="NEX" />
                  <span className="checkmark"></span>
                </label>

              </div>
            </div>
            <div className="item-box check-set">
              <div className="left-title">
                <p>IUCN評估</p>
              </div>
              <div className="right-check">
                <label className="check-item">EX
                  <input type="checkbox" name="iucn_category" value="EX" />
                  <span className="checkmark"></span>
                </label>
                {redCategories.map((item: Option, index: number) => {
                  return (
                    <label className="check-item" key={`red-category-${index}`}>
                      {item.label}
                      <input type="checkbox" name="red_category" value={item.value} />
                      <span className="checkmark"></span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="item-box check-set">
              <div className="left-title">
                <p>CITES附錄</p>
              </div>
              <div className="right-check">
                {citesRefs.map((item: Option, index: number) => {
                  return (
                    <label className="check-item" key={`cites-${index}`}>
                      {item.label}
                      <input type="checkbox" name="cites" value={item.value} />
                      <span className="checkmark"></span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="item-box">
              <div className="left-title">
                <p>更新日期</p>
              </div>
              <div className="item-box-set2">
                <div className="input-item w-350">
                  <div className="icon">
                    <img src="/images/cald.svg" />
                  </div>
                  <input type="date" placeholder="1990-01-01" name="date" />
                </div>
              </div>
            </div>
          </div>
					</form>
					<div className="btn-are">
						<button>清除</button>
						<button className="blue-btn" >搜尋</button>
					</div>
				</div>
			</div>
  </div>
}

export default AdvancedSearchForm
